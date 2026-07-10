// CHAT DE NUTRIO — respuestas por reglas, con 4 "personalidades" que el usuario
// elige en el onboarding (profile.chatStyle), y reconocimiento de antojos /
// pedidos de acompañamiento ("quiero un café, no sé con qué acompañarlo",
// "tengo hambre", "algo dulce", etc.) que sugiere recetas reales de RECIPES_DB
// filtradas por alergias y restricciones del perfil.
//
// Además reconoce saludos genéricos, despedidas ("hasta mañana", "chau", etc.)
// y estados de ánimo ("estoy enojado", "ando triste", "cansado", etc.), con
// una respuesta acorde a cada personalidad.
//
// No hay backend de IA en esta versión (eso vive en la arquitectura NutrIA
// aparte), así que la comprensión es por palabras clave normalizadas
// (sin acentos), no por interpretación libre del lenguaje.

// ---------- Utilidades de texto y filtrado ----------

function normalizeText(str) {
  return (str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function _ingredientsMatchKeyword(ingredients, keyword) {
  const kw = normalizeText(keyword);
  return ingredients.some(ing => normalizeText(ing).includes(kw));
}

// Filtra recetas de una categoría descartando alergias/ingredientes que no
// gustan, y priorizando las que calzan con las restricciones del perfil
// (vegetariano, sin_lactosa, sin_carbo, etc.) si hay alguna disponible.
function filterRecipesForProfile(category, profile) {
  let pool = getRecipesByCategory(category);
  if (!profile) return pool;

  const blocked = [...(profile.allergies || []), ...(profile.dislikes || [])];
  if (blocked.length) {
    pool = pool.filter(r => !blocked.some(b => _ingredientsMatchKeyword(r.ingredients, b)));
  }

  const restrictions = profile.restrictions || [];
  if (restrictions.length) {
    const tagged = pool.filter(r => restrictions.some(res => (r.tags || []).includes(res)));
    if (tagged.length) pool = tagged;
  }

  return pool;
}

function _pickRandom(arr, n) {
  const copy = [...arr];
  const result = [];
  while (copy.length && result.length < n) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

function _formatSuggestions(items) {
  return items.map(r => `${r.name} (${r.kcal} kcal)`).join(' o ');
}

// Categoría según la hora del día, para cuando el pedido es genérico
// ("tengo hambre", "no sé qué comer") sin mencionar café/mate.
function _categoryByHour() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'desayuno';
  if (hour >= 11 && hour < 15) return 'almuerzo';
  if (hour >= 15 && hour < 19) return 'meriendas';
  if (hour >= 19 && hour < 23) return 'cena';
  return 'meriendas';
}

// Palabras/raíces que disparan el modo "sugerir algo para acompañar/comer".
const PAIRING_KEYWORDS = ['cafe', 'mate', 'infusion'];
const CRAVING_KEYWORDS = [
  'no se que comer', 'no se con que', 'que como', 'tengo hambre',
  'antoj', 'acompan', 'algo dulce', 'algo salado', 'que le pongo',
  'para picar', 'ganas de comer'
];

function _detectsCraving(msgNorm) {
  return PAIRING_KEYWORDS.some(k => msgNorm.includes(k)) ||
         CRAVING_KEYWORDS.some(k => msgNorm.includes(k));
}

function _categoryForCraving(msgNorm) {
  if (PAIRING_KEYWORDS.some(k => msgNorm.includes(k))) return 'meriendas';
  return _categoryByHour();
}

// Despedidas: se revisan ANTES que el saludo genérico, porque "buenas noches"
// usado como despedida no debe caer en la rama de saludo.
const FAREWELL_KEYWORDS = [
  'hasta manana', 'hasta luego', 'hasta pronto', 'nos vemos', 'nos hablamos',
  'chau', 'chao', 'adios', 'me voy', 'me tengo que ir', 'bye', 'nos leemos'
];

function _detectsFarewell(msgNorm) {
  return FAREWELL_KEYWORDS.some(k => msgNorm.includes(k));
}

// Estados de ánimo: cada clave tiene raíces normalizadas para reconocer
// variantes con género/plural ("enojada", "enojado", "cansados", etc.).
const MOOD_KEYWORDS = {
  enojo: ['enojad', 'enoje', 'bronca', 'furios', 'irritad', 'indignad'],
  tristeza: ['triste', 'bajon', 'depre', 'mal hoy', 'me siento mal', 'angustia'],
  cansancio: ['cansad', 'agotad', 'sin energia', 'exhaust', 'reventad'],
  estres: ['estresad', 'ansios', 'nervios', 'abrumad', 'a mil'],
  alegria: ['feliz', 'content', 'genial', 'de diez', 'super bien', 'excelente dia']
};

function _detectMood(msgNorm) {
  for (const mood of Object.keys(MOOD_KEYWORDS)) {
    if (MOOD_KEYWORDS[mood].some(k => msgNorm.includes(k))) return mood;
  }
  return null;
}

// ---------- Personalidades ----------

const PERSONAS = {
  amigable: {
    greeting: (name) => `¡Hola${name}! 😊 Soy tu asistente de Nutrio, ¡qué bueno tenerte por acá! Contame cómo venís hoy con la comida o si tenés alguna duda.`,
    saludo: (name) => `¡Hola${name}! ¿Cómo estás? Contame en qué te puedo dar una mano hoy con tu alimentación.`,
    despedida: (name) => `¡Nos vemos${name}! Que la pases lindo, y no te olvides de tomar agua 💧`,
    dieta: (kcal) => kcal
      ? `Tu meta del día es de ${kcal} kcal. La podés ver tranquilo en tu Perfil, ¡vamos paso a paso!`
      : `Podés seguir el plan de calorías que armamos juntos en tu Perfil.`,
    receta: (restr) => restr
      ? `Ya tengo en cuenta lo tuyo (${restr}), así que fijate en Inicio o Semana, ahí te dejé opciones pensadas para vos.`
      : `Mirá la pestaña de Inicio o Semana, armé opciones lindas pensadas en tu objetivo.`,
    evitar: `Cuando quieras, actualizá lo que no te gusta desde Perfil > Reiniciar Aplicación. ¡Sin drama!`,
    agua: (vasos) => vasos
      ? `¡Dale para adelante con esos ${vasos} vasos de agua! Te ayuda un montón con la energía del día.`
      : `Tomar agua seguido te va a ayudar mucho, ¡metele!`,
    antojo: (suggestions) => `¡Buena onda! Para acompañar te tiro algunas ideas: ${suggestions}. Tocá la receta en Inicio o Semana si querés ver el paso a paso.`,
    antojoEmpty: `Mmm, no encontré algo que calce 100% con tu perfil ahora mismo, pero date una vuelta por la pestaña Semana, seguro hay algo rico esperándote.`,
    moods: {
      enojo: `Uy, se nota que venís con bronca. No hace falta contarme todo, pero si un té calentito o algo rico te baja un cambio, decime y te tiro ideas.`,
      tristeza: `Lamento que estés pasando un mal momento. Estoy para ayudarte con la comida, aunque sea algo chiquito hoy también suma. Si sentís que es más que un mal día, también ayuda hablarlo con alguien de confianza. Contame si querés que te sugiera algo puntual.`,
      cansancio: `Uf, los días así cansan. Capaz algo simple y nutritivo te ayuda a recuperar energía. ¿Querés que te tire una idea rápida?`,
      estres: `Se nota que el día viene pesado. Respirá hondo un toque, y si querés desconectar pensando en la comida, contame y buscamos algo fácil.`,
      alegria: `¡Qué bueno escuchar eso! Con esa energía seguro se te ocurre algo rico para festejar el día 🎉`
    },
    default: `Todo bien, contame más así te ayudo mejor con recetas o dudas puntuales.`
  },

  motivador: {
    greeting: (name) => `¡Vamos${name}! 💪 Soy tu asistente de Nutrio y estoy para ayudarte a cumplir tus objetivos. ¡Contame cómo la estás rompiendo hoy con la comida!`,
    saludo: (name) => `¡Buenísimo que estés acá${name}! Cada consulta suma. ¿En qué te ayudo hoy?`,
    despedida: (name) => `¡Así se hace${name}! Nos vemos pronto, seguí firme con tu objetivo 💪`,
    dieta: (kcal) => kcal
      ? `¡Tu meta es de ${kcal} kcal por día! Cumplila con constancia y los resultados van a llegar, la vas a romper.`
      : `Seguí el plan de calorías que armamos, ¡constancia es la clave del éxito!`,
    receta: (restr) => restr
      ? `Armé opciones que respetan lo tuyo (${restr}). Andá a Inicio o Semana y elegí con confianza, ¡vas a comer buenísimo y vas a rendir al máximo!`
      : `Andá a Inicio o Semana, ahí te dejé opciones a full para que sigas avanzando hacia tu objetivo.`,
    evitar: `Si algo no te cierra, actualizalo desde Perfil > Reiniciar Aplicación y seguimos mejorando el plan juntos.`,
    agua: (vasos) => vasos
      ? `¡${vasos} vasos de agua por día, sin excusas! Hidratarte es parte del entrenamiento invisible.`
      : `¡Tomá agua todo el día, eso también es parte de ganar!`,
    antojo: (suggestions) => `¡Ahí vamos! Para acompañar, metele con: ${suggestions}. ¡Elegí y seguí rindiendo al máximo!`,
    antojoEmpty: `No tengo una sugerencia exacta para tu perfil ahora, pero no aflojes: mirá la pestaña Semana y elegí algo que te sume.`,
    moods: {
      enojo: `Esa bronca también es energía. Canalizala: tomate cinco minutos, y si querés, buscamos algo rico que te ayude a bajar un cambio.`,
      tristeza: `Los días grises también son parte del camino, no aflojes. Si necesitás algo más que esto, hablarlo con alguien de confianza también suma mucho. Mientras tanto, contame si querés una idea de comida para levantar el ánimo.`,
      cansancio: `El cansancio es señal de que vas a fondo. Una comida que te recargue puede ayudarte a seguir. ¿Te tiro una sugerencia rápida?`,
      estres: `Día a mil, lo sé. Respirá, ordená prioridades, y si el estrés te llevó a comer mal, arrancamos de nuevo ahora. ¿Buscamos algo simple?`,
      alegria: `¡Esa energía es oro! Aprovechala y sumale una comida que te haga sentir todavía mejor 🔥`
    },
    default: `¡Dale que vamos bien! Contame más para seguir ayudándote a cumplir tu objetivo.`
  },

  tecnico: {
    greeting: (name) => `Hola${name}. Soy el asistente de Nutrio. Indicame tu consulta sobre alimentación, plan calórico o recetas y te doy una respuesta puntual.`,
    saludo: (name) => `Hola${name}. ¿En qué puedo asistirte hoy?`,
    despedida: (name) => `Hasta luego${name}. Quedo disponible para tu próxima consulta.`,
    dieta: (kcal) => kcal
      ? `Tu requerimiento calórico diario calculado es de ${kcal} kcal, en base a la ecuación de Mifflin-St Jeor ajustada por tu nivel de actividad y objetivo. Podés consultarlo en Perfil.`
      : `Tu plan calórico está disponible en la pestaña Perfil.`,
    receta: (restr) => restr
      ? `Las opciones en Inicio y Semana ya están filtradas según tus restricciones registradas (${restr}).`
      : `Las opciones en Inicio y Semana están calculadas según tu perfil y objetivo actual.`,
    evitar: `Para actualizar ingredientes a evitar o alergias, reingresá tus datos desde Perfil > Reiniciar Aplicación.`,
    agua: (vasos) => vasos
      ? `Tu ingesta de referencia registrada es de ${vasos} vasos de agua por día. Es un valor orientativo, ajustalo según tu actividad y clima.`
      : `Se recomienda una hidratación adecuada y constante a lo largo del día.`,
    antojo: (suggestions) => `Opciones compatibles con tu perfil para este momento: ${suggestions}. Podés ver el detalle completo tocando la receta en Inicio o Semana.`,
    antojoEmpty: `No hay una coincidencia exacta con tu perfil en este momento. Revisá la pestaña Semana para otras alternativas disponibles.`,
    moods: {
      enojo: `Registro que estás pasando por un momento de irritación. No es infrecuente que esto influya en las decisiones alimentarias. Si querés, puedo sugerirte una opción simple para este momento.`,
      tristeza: `Lamento que estés atravesando un momento difícil. Puedo ayudarte con una sugerencia de comida puntual, aunque si la sensación persiste, conversarlo con alguien de confianza o un profesional también puede ser de ayuda.`,
      cansancio: `El cansancio suele estar asociado a bajos niveles de energía disponible. Una comida balanceada puede ser de utilidad. ¿Querés una sugerencia concreta?`,
      estres: `Los niveles altos de estrés pueden afectar tus hábitos alimentarios. Puedo sugerirte algo simple y rápido de preparar si lo necesitás.`,
      alegria: `Registrado. Un buen estado de ánimo también es un buen momento para probar algo nuevo del recetario. ¿Te interesa una sugerencia?`
    },
    default: `Indicame más detalles de tu consulta para poder responderte con precisión.`
  },

  humor: {
    greeting: (name) => `¡Eh${name}! 🥑 Acá tu asistente de Nutrio reportándose, listo para hablar de comida en serio (y de vez en cuando en broma). ¿Qué se te antoja saber hoy?`,
    saludo: (name) => `¡Qué onda${name}! Llegaste al lugar correcto para hablar de kcal sin sufrir. ¿En qué te ayudo?`,
    despedida: (name) => `¡Nos vemos${name}! Andá tranquilo, que yo me quedo cuidando la heladera 🥑👋`,
    dieta: (kcal) => kcal
      ? `Tu meta diaria es ${kcal} kcal. Ni una caloría de más, ni una de menos... bueno, alguna sí, no seamos tan estrictos. Mirá el detalle en Perfil.`
      : `El plan de calorías está en tu Perfil, esperándote como esa alacena que decís que vas a ordenar.`,
    receta: (restr) => restr
      ? `Ya anoté lo tuyo (${restr}), así que en Inicio o Semana vas a encontrar cosas ricas que no te van a hacer mal ni al cuerpo ni al humor.`
      : `Andá a Inicio o Semana, hay opciones más ricas que discutir con tu heladera vacía.`,
    evitar: `Si algo no te copa, lo sacamos: Perfil > Reiniciar Aplicación y arrancamos de cero, sin rencores.`,
    agua: (vasos) => vasos
      ? `${vasos} vasos de agua al día, ¡y no, el mate no cuenta como los siete! (bueno, un poco sí).`
      : `Tomá agua, que la deshidratación no perdona ni a los más aguantadores.`,
    antojo: (suggestions) => `Para que ese café no tome solo: ${suggestions}. Elegí rápido antes de que se enfríe (el café, no vos).`,
    antojoEmpty: `Che, con tu perfil no me cerró ninguna opción justo ahora, ni que fuera receta de la abuela con ingrediente secreto. Fijate en Semana, ahí seguro hay algo.`,
    moods: {
      enojo: `Uh, se nota el humor de piso de obra hoy. Ni la heladera se salva, ¿no? Si querés, te tiro algo rico para bajar el volumen del enojo.`,
      tristeza: `Che, lamento que andes bajón. No te prometo arreglarte el día con una receta, pero puede ayudar un poquito. Y si el bajón viene fuerte de verdad, también está bueno hablarlo con alguien de confianza. ¿Te busco algo rico igual?`,
      cansancio: `Se te nota el "no doy más" hasta en el mensaje. Una comida que te recargue las pilas puede venir bien, ¿te tiro una idea?`,
      estres: `Día modo licuadora, ¿eh? Respirá, que ni el mejor asado se apura. ¿Buscamos algo fácil para no sumar estrés en la cocina?`,
      alegria: `¡Uh, qué buena onda! Con esa alegría hasta la ensalada sabe mejor. ¿Querés que te tire algo rico para festejar?`
    },
    default: `Contame un poco más, que con media pregunta ni yo ni la heladera sabemos bien qué hacer.`
  }
};

// ---------- Motor principal ----------

const ChatApp = {
  _getPersona(profile) {
    const style = profile && profile.chatStyle && PERSONAS[profile.chatStyle]
      ? profile.chatStyle
      : 'amigable';
    return PERSONAS[style];
  },

  // Primer mensaje que ve el usuario al entrar al chat, ya con su nombre y estilo.
  getGreeting(profile) {
    const persona = this._getPersona(profile);
    const name = profile && profile.name ? `, ${profile.name}` : '';
    let greeting = persona.greeting(name);
    if (profile && profile.chatCustomNote) {
      greeting += ` (Tomé nota: "${profile.chatCustomNote}")`;
    }
    return greeting;
  },

  // profile es opcional: si se pasa, el bot responde de forma más personalizada
  // y según la personalidad elegida en el onboarding (profile.chatStyle).
  getBotResponse(userMessage, profile) {
    const msgNorm = normalizeText(userMessage);
    const persona = this._getPersona(profile);
    const name = profile && profile.name ? `, ${profile.name}` : '';

    // 1) Antojos / pedidos de acompañamiento: "quiero un café, no sé con qué
    //    acompañarlo", "tengo hambre", "algo dulce", etc. Se resuelve con
    //    recetas reales, filtradas por alergias y restricciones del perfil.
    if (_detectsCraving(msgNorm)) {
      const category = _categoryForCraving(msgNorm);
      const pool = filterRecipesForProfile(category, profile);
      const picks = _pickRandom(pool, Math.min(3, pool.length));
      if (!picks.length) return persona.antojoEmpty;
      return persona.antojo(_formatSuggestions(picks));
    }

    // 2) Despedidas: se chequean antes que el saludo genérico para que
    //    "buenas noches" o "hasta mañana" no caigan en la rama de saludo.
    if (_detectsFarewell(msgNorm)) {
      return persona.despedida(name);
    }

    // 3) Estados de ánimo: respuesta empática acorde a la personalidad,
    //    sin diagnosticar nada, solo acompañando y ofreciendo ayuda concreta.
    const mood = _detectMood(msgNorm);
    if (mood && persona.moods && persona.moods[mood]) {
      return persona.moods[mood];
    }

    if (msgNorm.includes('hola') || msgNorm.includes('buen')) {
      return persona.saludo(name);
    }
    if (msgNorm.includes('dieta') || msgNorm.includes('calorias') || msgNorm.includes('kcal')) {
      return persona.dieta(profile && profile.targetKcal ? profile.targetKcal : null);
    }
    if (msgNorm.includes('agua') || msgNorm.includes('hidrat')) {
      return persona.agua(profile && profile.waterGlasses ? profile.waterGlasses : null);
    }
    if (msgNorm.includes('receta') || msgNorm.includes('cocinar') || msgNorm.includes('comer')) {
      const restr = profile && profile.restrictions && profile.restrictions.length
        ? profile.restrictions.join(', ')
        : null;
      return persona.receta(restr);
    }
    if (msgNorm.includes('no me gusta') || msgNorm.includes('alerg') || msgNorm.includes('evitar')) {
      return persona.evitar;
    }
    return persona.default;
  }
};
