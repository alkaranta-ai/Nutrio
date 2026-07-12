(function () {
  const MAX_MB_FOTO = 4;
  const MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

  const INSTRUCCIONES_FOTO = `
El usuario te mandó una FOTO de alimentos o ingredientes que tiene a mano
(heladera, alacena, mesada, o un plato ya armado). Tu tarea:

- Identificá los alimentos/ingredientes que reconocés en la imagen. Si algo
  no se distingue con claridad, decilo con onda en vez de inventarlo
  ("no se ve bien qué es esto de acá, ¿me decís?").
- Sugerí 2 a 3 ideas de recetas o combinaciones concretas que se puedan
  hacer con eso (podés asumir que tiene sal, aceite, y condimentos básicos
  de alacena aunque no se vean en la foto, pero NO asumas otros ingredientes
  que no estén ni en la foto ni en su alacena/heladera si esa info está en
  el contexto).
- Para cada idea: nombre corto de la receta + los pasos MUY resumidos (1-2
  líneas), no una receta completa paso a paso.
- Respetá SIEMPRE alergias, restricciones y condiciones de salud del
  [DATOS ACTUALES] del usuario: si algo de la foto no lo puede comer,
  avisale y no lo incluyas en ninguna sugerencia.
- Si la foto no tiene nada que ver con comida (o no se ve nada útil),
  decilo con humor liviano y pedile que mande otra o cuente qué tiene.
- Mismo estilo que siempre: español rioplatense, 2-4 oraciones salvo que
  haga falta más para las 2-3 ideas, sin sonar receta de manual.
`.trim();

  function archivoValido(file) {
    if (!file) return 'no llegó ningún archivo';
    if (!MIME_PERMITIDOS.includes(file.type)) return 'formato no soportado';
    if (file.size > MAX_MB_FOTO * 1024 * 1024) return `imagen supera los ${MAX_MB_FOTO}MB`;
    return null;
  }

  function archivoABase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = String(reader.result).split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('no_se_pudo_leer_la_imagen'));
      reader.readAsDataURL(file);
    });
  }

  async function pedirleALaIAConFoto(base64, mimeType, userMessage, profile) {
    const contexto = window.ChatApp._construirContextoIA
      ? window.ChatApp._construirContextoIA(profile)
      : '';
    const systemPromptBase = window.ChatApp._construirSystemPromptIA
      ? window.ChatApp._construirSystemPromptIA(profile)
      : '';

    const systemPrompt = `${systemPromptBase}\n\n${INSTRUCCIONES_FOTO}`;

    const textoUsuario = userMessage && userMessage.trim()
      ? userMessage.trim()
      : 'Te mando una foto de lo que tengo a mano. Sugerime qué puedo cocinar con esto.';

    const mensajeConContexto =
      `[INSTRUCCIÓN DE IDIOMA] Respondé en español rioplatense (Argentina), nunca en inglés.\n` +
      `[DATOS ACTUALES DEL USUARIO]\n${contexto}\n` +
      `[MENSAJE DEL USUARIO]\n${textoUsuario}`;

    const contents = [
      ...(window.ChatApp._historialIA || []),
      {
        role: 'user',
        parts: [
          { text: mensajeConContexto },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      },
    ];

    const res = await fetch(window.ChatApp._WORKER_URL || 'https://misty-cell-91e2finance-chat-alkaranta.alkaranta.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, contents }),
    });

    if (!res.ok) throw new Error('worker_error_' + res.status);
    const data = await res.json();
    if (!data.text) throw new Error('sin_texto');

    if (window.ChatApp._historialIA) {
      window.ChatApp._historialIA.push({ role: 'user', parts: [{ text: '[Usuario mandó una foto de alimentos]' }] });
      window.ChatApp._historialIA.push({ role: 'model', parts: [{ text: data.text }] });
    }

    return data.text;
  }

  function fallbackTexto(motivo) {
    const base = 'Uh, no pude ver bien la foto ahora 📷 ¿Me contás qué tenés a mano y te tiro ideas igual?';
    const debug = new URLSearchParams(window.location.search).get('debug') === 'ia';
    return debug ? `[DEBUG: ${motivo}] ${base}` : base;
  }

  window.ChatApp.getBotResponseConFoto = async function (file, userMessage, profile) {
    const error = archivoValido(file);
    if (error) {
      return { text: fallbackTexto(error), category: 'ia', idx: null, source: 'reglas' };
    }

    if (!navigator.onLine) {
      return { text: fallbackTexto('sin conexión a internet'), category: 'ia', idx: null, source: 'reglas' };
    }

    const hoy = new Date().toISOString().slice(0, 10);
    const usoKey = `nutrio_ai_uso_${hoy}`;
    const uso = parseInt(localStorage.getItem(usoKey) || '0', 10);
    if (uso >= 40) {
      return { text: fallbackTexto('límite diario de IA alcanzado'), category: 'ia', idx: null, source: 'reglas' };
    }

    try {
      const base64 = await archivoABase64(file);
      const text = await pedirleALaIAConFoto(base64, file.type, userMessage, profile);
      localStorage.setItem(usoKey, String(uso + 1));
      return { text, category: 'ia', idx: null, source: 'ia' };
    } catch (err) {
      console.warn('NutrioChatAI (fotos): fallback →', err.message);
      return { text: fallbackTexto(err.message), category: 'ia', idx: null, source: 'reglas' };
    }
  };
})();
