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
  const MAX_HISTORIAL = 10; // turnos de contexto que se le mandan a la IA

  const CHAT_STYLE_INSTRUCTIONS = {
    amigable: 'Tono amigable y cercano, como un amigo que sabe de nutrición.',
    motivador: 'Tono motivador, con energía, como un coach que te empuja a seguir.',
    tecnico: 'Tono técnico y directo, sin vueltas, priorizando datos concretos.',
    humor: 'Tono con humor y onda, chistes livianos, sin dejar de ser útil.'
  };

  const SYSTEM_PROMPT_BASE = `
IDIOMA: Respondé SIEMPRE en español rioplatense (Argentina). Nunca respondas
en inglés ni en ningún otro idioma, sin importar en qué idioma te escriba el
usuario o qué contenga el contexto que te paso. Esta regla no tiene excepciones.

Sos NutrIO, el asistente nutricional de Nutrio, una app de alimentación
personal para usuarios de habla hispana. Hablás en español rioplatense, con
lunfardo natural (che, posta, morfar, laburo) cuando encaja, pero sin exagerar
ni sonar forzado — como un amigo que sabe de nutrición, no como una app fría.

Reglas:
- SIEMPRE en español rioplatense, nunca en inglés (repetido a propósito: es la regla más importante).
- Respuestas cortas: 2 a 4 oraciones, salvo que el usuario pida más detalle.
- Usá SIEMPRE los datos reales del usuario que te paso en [DATOS ACTUALES].
  Nunca inventes kcal, ingredientes, recetas, rachas o logros que no estén ahí.
- No inventes recetas ni platos que no te haya dado el usuario o el contexto:
  si te piden una idea de comida concreta con nombre/ingredientes/kcal
  exactos, decile con onda que para eso mejor pida "qué puedo comer" o mire
  Inicio/Semana, porque ahí sí la app usa su base real de recetas filtrada
  por sus restricciones y alergias.
- Si falta un dato porque el usuario no cargó nada todavía, decilo con onda
  y pedile que cargue algo — no lo inventes ni lo asumas.
- Respetá SIEMPRE las alergias, restricciones alimentarias y condiciones de
  salud del [DATOS ACTUALES]: nunca sugieras ni menciones con buena onda algo
  que el usuario no puede comer.
- No sos nutricionista certificado: para condiciones de salud (diabetes,
  hipertensión, colesterol), embarazo, o cambios de dieta grandes, aclará
  que es orientación general, no reemplaza a un profesional de la salud.
- Máximo 1-2 emojis por respuesta.
- Mantené el hilo: si el usuario responde corto ("dale", "por qué", "y
  entonces qué hago"), entendé que se refiere a tu mensaje anterior y
  seguí esa conversación, no arranques de cero.
- Si el usuario está frustrado, ansioso o angustiado con la comida o su
  cuerpo, priorizá la contención antes que tirarle números o consejos fríos.
- Si te preguntan algo que NO tiene que ver con nutrición/la app (cultura
  general, matemática, consejos random, charla de la vida, lo que sea):
  respondé igual, con la misma onda y brevedad. Sos NutrIO el personaje,
  no un bot que sólo sabe de comida — no te niegues ni digas "yo de eso no
  sé" ni fuerces la vuelta al tema nutricional si no pinta naturalmente.
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
      `[INSTRUCCIÓN DE IDIOMA] Respondé en español rioplatense (Argentina), nunca en inglés.\n` +
      `[DATOS ACTUALES DEL USUARIO]\n${contexto}\n` +
      `[MENSAJE DEL USUARIO]\n${userMessage}`;

    const contents = [
      ...window.ChatApp._historialIA,
      { role: 'user', parts: [{ text: mensajeConContexto }] },
    ];

    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, contents }),
    });

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
      /dia libre|modo dia libre|activa dia libre|quiero mi dia libre/
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

    if (!navigator.onLine || limiteAlcanzado()) {
      const r = this.getBotResponse(userMessage, profile);
      return { ...r, source: 'reglas' };
    }

    try {
      const text = await pedirleALaIA(userMessage, profile);
      return { text, category: 'ia', idx: null, source: 'ia' };
    } catch (err) {
      console.warn('NutrioChatAI: fallback al motor de reglas →', err.message);
      const r = this.getBotResponse(userMessage, profile);
      return { ...r, source: 'reglas' };
    }
  };
})();
