// ==========================================================================
// NUTRIO CHAT AI — capa híbrida sobre ChatApp (app.js)
//
// Mismo patrón que financeChatAI.js en Alkaranta: NO reemplaza el motor de
// reglas, lo usa como red de seguridad Y como fuente de verdad para todo lo
// que muta datos reales (registrar comidas, racha, logros, modo barman).
//
// Flujo:
//   1) Si el mensaje es uno de los "comandos estructurales" que YA maneja
//      ChatApp con efectos reales (anotar una comida, activar/desactivar
//      modo barman, preguntar racha/logros/resumen del día) → se resuelve
//      SIEMPRE con el motor de reglas. La IA no inventa kcal ni togglea
//      estados que después la app no sabría reflejar.
//   2) Para todo lo demás (charla libre, dudas, motivación, "qué me
//      recomendás", PREGUNTAS GENERALES sin relación con nutrición, etc.),
//      si hay internet y no se llegó al límite diario → le pregunta a
//      Gemini, pasándole el contexto REAL del usuario (perfil, kcal
//      objetivo, lo que comió hoy, racha, logros).
//   3) Si algo falla (sin internet, Worker caído, límite diario alcanzado)
//      → cae automáticamente al motor de reglas de ChatApp.getBotResponse,
//      que sigue funcionando exactamente igual que antes.
//
// REQUIERE que app.js esté cargado ANTES que este archivo:
//   <script src="js/app.js"></script>
//   <script src="js/nutrioChatAI.js"></script>
//
// NOTA SOBRE EL WORKER: reutiliza el mismo Worker de Cloudflare que ya
// desplegaste para Alkaranta (misty-cell-91e2finance-chat-alkaranta), porque
// ese Worker es un passthrough genérico a Gemini: recibe { systemPrompt,
// contents } y no tiene nada hardcodeado de finanzas. Si preferís separar
// el uso/costos de Nutrio del de Alkaranta, desplegá una copia del mismo
// Worker con otro nombre y cambiá WORKER_URL más abajo — el código no
// necesita ningún otro cambio.
//
// CAMBIO EN LA UI (en UI.sendChat, dentro de app.js):
// Donde hoy tenés:
//   const response = ChatApp.getBotResponse(msg, profile);
//   ...pintás response.text usando response.category / response.idx para 👍👎...
// reemplazá por (es async):
//   const response = await ChatApp.getBotResponseSmart(msg, profile);
//   ...pintás response.text igual que antes...
// Los botones 👍/👎 (rateResponse) solo tienen sentido cuando la respuesta
// vino del motor de reglas (response.source === 'reglas'), porque ahí sí
// hay un category/idx real para aprender de tus variantes. Si
// response.source === 'ia', no pintes los botones 👍/👎 (o dejalos pero
// no hace nada grave: rateResponse con category:'ia' simplemente no
// afecta ninguna variante existente).
// Mostrá el indicador de "escribiendo..." mientras se resuelve la promesa:
// la respuesta de la IA tarda 1-2 segundos (vs. instantáneo del motor de
// reglas), así que la espera se tiene que sentir intencional, no colgada.
// ==========================================================================

(function () {
  const WORKER_URL = 'https://misty-cell-91e2finance-chat-alkaranta.alkaranta.workers.dev';
  const LIMITE_DIARIO = 40; // mensajes con IA por día por usuario/dispositivo (cupo propio de Nutrio)
  const MAX_HISTORIAL = 6; // turnos de contexto que se le mandan a la IA (menos historial = payload más chico = respuesta más rápida)
  const TIMEOUT_MS = 7000; // si Gemini/el Worker no contestan en este tiempo, cae al motor de reglas en vez de dejar al usuario esperando

  const CHAT_STYLE_INSTRUCTIONS = {
    amigable: 'Tono amigable y cercano, como un amigo que sabe de nutrición.',
    motivador: 'Tono motivador, con energía, como un coach que te empuja a seguir.',
    tecnico: 'Tono técnico y directo, sin vueltas, priorizando datos concretos.',
    humor: 'Tono con humor y onda, chistes livianos, sin dejar de ser útil.'
  };

  const SYSTEM_PROMPT_BASE = `
Sos NutrIO, asistente nutricional de Nutrio (app de alimentación en español).
Hablás SIEMPRE en español rioplatense (Argentina), nunca en inglés ni otro
idioma, sin excepciones, sea cual sea el idioma del usuario o del contexto.
Lunfardo natural (che, posta, morfar, laburo) cuando encaja, sin forzarlo.

Reglas:
- 2 a 4 oraciones, salvo que pidan más detalle. Máximo 1-2 emojis.
- Usá solo los datos de [DATOS ACTUALES]; nunca inventes kcal, ingredientes,
  recetas, rachas o logros que no estén ahí. Si falta un dato, decilo con
  onda y pedí que lo cargue.
- No inventes recetas/platos concretos: si piden una idea puntual con
  ingredientes/kcal exactos, derivá con onda a "qué puedo comer" o
  Inicio/Semana (ahí la app usa su base real filtrada por restricciones).
- Respetá siempre alergias, restricciones y condiciones de salud del
  contexto: nunca sugieras algo que el usuario no puede comer.
- No sos nutricionista certificado: ante condiciones de salud, embarazo o
  cambios grandes de dieta, aclará que es orientación general.
- Mantené el hilo: respuestas cortas del usuario ("dale", "por qué") se
  refieren a tu mensaje anterior, no arranques de cero.
- Si el usuario está frustrado o angustiado con la comida/su cuerpo,
  priorizá la contención antes que números o consejos fríos.
- Si preguntan algo sin relación a nutrición (cultura general, charla,
  etc.), respondé igual con la misma onda y brevedad, sin negarte ni forzar
  la vuelta al tema nutricional.
`.trim();

  function usageKey() {
    const hoy = new Date().toISOString().slice(0, 10);
    return `nutrio_ai_uso_${hoy}`;
  }

  function usoDeHoy() {
    return parseInt(localStorage.getItem(usageKey()) || '0', 10);
  }

  function registrarUso() {
    localStorage.setItem(usageKey(), String(usoDeHoy() + 1));
  }

  function limiteAlcanzado() {
    return usoDeHoy() >= LIMITE_DIARIO;
  }

  // Modo debug SIN consola: agregá "?debug=ia" al final de la URL de tu
  // app (ej. https://tuapp.com/index.html?debug=ia) y recargá. Mientras
  // esté activo, si la IA falla por lo que sea, el motivo del error se
  // pega directo en el texto de la respuesta del chat, así se ve en la
  // pantalla sin abrir nada técnico. Sacá el "?debug=ia" de la URL (o
  // recargá sin él) para volver al comportamiento normal.
  function debugActivo() {
    try {
      return new URLSearchParams(window.location.search).get('debug') === 'ia';
    } catch (e) {
      return false;
    }
  }

  function construirSystemPrompt(profile) {
    const estilo = profile && profile.chatStyle && CHAT_STYLE_INSTRUCTIONS[profile.chatStyle];
    const custom = profile && profile.chatCustom;
    let extra = '';
    if (estilo) extra += `\n\nESTILO PREFERIDO POR EL USUARIO: ${estilo}`;
    if (custom) extra += `\nEl usuario también pidió esto sobre cómo hablarle: "${custom}"`;
    return SYSTEM_PROMPT_BASE + extra;
  }

  // Arma un resumen en texto plano del estado real del usuario, reusando
  // datos que YA existen en app.js (perfil, MealLog, Streak, Achievements,
  // ChatApp._getMealSlot) — no duplica lógica, solo la traduce a algo que
  // la IA pueda leer.
  function construirContexto(profile) {
    const lineas = [];
    const slot = window.ChatApp._getMealSlot();
    const ahora = new Date();

    lineas.push(`Hora actual: ${ahora.getHours()}:${String(ahora.getMinutes()).padStart(2, '0')} (franja: ${slot.label})`);

    if (profile) {
      const nombre = profile.nickname || profile.name;
      lineas.push(`Nombre/apodo: ${nombre}`);
      if (profile.targetKcal) lineas.push(`Meta calórica diaria: ${profile.targetKcal} kcal`);
      if (profile.goals && profile.goals.length) lineas.push(`Objetivo: ${profile.goals.join(', ')}`);
      if (profile.activity) lineas.push(`Nivel de actividad: ${profile.activity}`);
      if (profile.healthConditions && profile.healthConditions.length) {
        lineas.push(`Condiciones de salud: ${profile.healthConditions.join(', ')}`);
      }
      if (profile.allergies && profile.allergies.length) {
        lineas.push(`Alergias: ${profile.allergies.join(', ')}`);
      }
      if (profile.restrictions && profile.restrictions.length) {
        lineas.push(`Restricciones alimentarias: ${profile.restrictions.join(', ')}`);
      }
      if (profile.dislikes && profile.dislikes.length) {
        lineas.push(`No le gusta: ${profile.dislikes.join(', ')}`);
      }
    } else {
      lineas.push('Todavía no hay perfil cargado.');
    }

    if (typeof MealLog !== 'undefined') {
      const log = MealLog.getToday();
      if (log.length > 0) {
        const totalKcal = MealLog.totalKcalToday();
        const items = log.map(e => `${e.name}${e.kcal ? ` (${e.kcal} kcal)` : ''}`).join(', ');
        lineas.push(`Comidas registradas hoy: ${items}`);
        lineas.push(`Kcal acumuladas hoy (según lo registrado): ${totalKcal}`);
      } else {
        lineas.push('Todavía no registró ninguna comida hoy.');
      }
    }

    if (typeof Streak !== 'undefined') {
      lineas.push(`Racha actual: ${Streak.getCount()} día(s), mejor racha: ${Streak.getLongest()} día(s)`);
    }

    if (typeof Achievements !== 'undefined') {
      const unlocked = Achievements.getAllWithStatus().filter(a => a.unlocked);
      lineas.push(unlocked.length > 0
        ? `Logros desbloqueados: ${unlocked.map(a => a.name).join(', ')}`
        : 'Todavía no desbloqueó ningún logro.');
    }

    return lineas.join('\n');
  }

  window.ChatApp._historialIA = window.ChatApp._historialIA || [];

  function agregarAlHistorial(role, text) {
    const h = window.ChatApp._historialIA;
    h.push({ role, parts: [{ text }] });
    while (h.length > MAX_HISTORIAL) h.shift();
  }

  async function pedirleALaIA(userMessage, profile) {
    const contexto = construirContexto(profile);
    const systemPrompt = construirSystemPrompt(profile);

    const mensajeConContexto =
      `[DATOS ACTUALES DEL USUARIO]\n${contexto}\n` +
      `[MENSAJE DEL USUARIO]\n${userMessage}`;

    const contents = [
      ...window.ChatApp._historialIA,
      { role: 'user', parts: [{ text: mensajeConContexto }] },
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res;
    try {
      res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, contents }),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') throw new Error('timeout_' + TIMEOUT_MS + 'ms');
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) throw new Error('worker_error_' + res.status);
    const data = await res.json();
    if (!data.text) throw new Error('sin_texto');

    agregarAlHistorial('user', userMessage);
    agregarAlHistorial('model', data.text);
    registrarUso();

    return data.text;
  }

  // Comandos estructurales: siempre se resuelven con el motor de reglas
  // porque mutan estado real (MealLog, Achievements, racha, modo barman) o
  // necesitan datos exactos (kcal reales de hoy) que la IA no puede
  // garantizar. Reusa la misma normalización que ChatApp._normalize para
  // que la detección sea consistente con la que ya hace el motor de reglas.
  function esComandoEstructural(userMessage) {
    const msg = window.ChatApp._normalize(userMessage);

    if (window.ChatApp._barmanMode) return true; // adentro del modo barman, todo es estructural

    const patrones = [
      /modo barman|modo bartender|activa barman|activar barman|quiero un coctel|dame un trago|quiero un trago/,
      /\b(?:ya\s+)?com[ií]\s+.+/, // "comí X" / "ya comí X" → registra una comida real
      /acabo de comer\s+.+/,
      /que comi hoy|que comi en el dia|cuanto comi|cuanto llevo comido|cuantas calorias llevo|cuantas kcal llevo|mi registro de hoy|que anote hoy|resumen del dia|resumen de hoy/,
      /mi racha|cual es mi racha|racha tengo|cuantos dias llevo/,
      /mis logros|mis insignias|que logros tengo|mis medallas/,
      /dia libre|modo dia libre|activa dia libre|quiero mi dia libre/,
      /^ayuda$|^help$|menu de ayuda|que podes hacer|que sabes hacer|que comandos hay/, // comando "ayuda" (chips)
      /receta argentina|comida argentina|algo argentino|plato argentino|cocina argentina|recetas argentinas/ // recetas AR
    ];

    // Excluimos preguntas tipo "qué puedo comer" para no confundirlas con
    // "comí X" (el motor de reglas ya distingue esto con noEsPreguntaSobreComer,
    // así que igual lo dejamos pasar por reglas: es más seguro que la IA no
    // toque nada relacionado a registrar comidas).
    return patrones.some(re => re.test(msg));
  }

  // Punto de entrada único para la UI. SIEMPRE devuelve un objeto
  // { text, category, idx, source }, nunca rechaza la promesa: si la IA
  // falla por lo que sea, cae solo al motor de reglas sin que el usuario
  // note el problema. "source" indica de dónde vino la respuesta, para que
  // la UI sepa si tiene sentido mostrar los botones 👍/👎.
  window.ChatApp.getBotResponseSmart = async function (userMessage, profile) {
    if (esComandoEstructural(userMessage)) {
      const r = this.getBotResponse(userMessage, profile);
      return { ...r, source: 'reglas' };
    }

    if (!navigator.onLine) {
      const r = this.getBotResponse(userMessage, profile);
      if (debugActivo()) r.text = `[DEBUG: sin conexión a internet] ${r.text}`;
      return { ...r, source: 'reglas' };
    }

    if (limiteAlcanzado()) {
      const r = this.getBotResponse(userMessage, profile);
      if (debugActivo()) r.text = `[DEBUG: límite diario de IA alcanzado (${usoDeHoy()}/${LIMITE_DIARIO})] ${r.text}`;
      return { ...r, source: 'reglas' };
    }

    try {
      const text = await pedirleALaIA(userMessage, profile);
      return { text, category: 'ia', idx: null, source: 'ia' };
    } catch (err) {
      console.warn('NutrioChatAI: fallback al motor de reglas →', err.message);
      const r = this.getBotResponse(userMessage, profile);
      if (debugActivo()) r.text = `[DEBUG: ${err.message}] ${r.text}`;
      return { ...r, source: 'reglas' };
    }
  };
  window.ChatApp._construirContextoIA = construirContexto;
  window.ChatApp._construirSystemPromptIA = construirSystemPrompt;
  window.ChatApp._WORKER_URL = WORKER_URL;
})();
