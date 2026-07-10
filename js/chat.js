// CHAT DE NUTRIO — respuestas por reglas, con 4 "personalidades" que el usuario
// elige en el onboarding (profile.chatStyle). Si el usuario dejó una nota
// personalizada (profile.chatCustomNote), se la recordamos al final del saludo
// para que sepa que la tuvimos en cuenta, aunque el motor de reglas no la
// interprete libremente (no hay backend de IA en esta versión de Nutrio).

const PERSONAS = {
  amigable: {
    greeting: (name) => `¡Hola${name}! 😊 Soy tu asistente de Nutrio, ¡qué bueno tenerte por acá! Contame cómo venís hoy con la comida o si tenés alguna duda.`,
    saludo: (name) => `¡Hola${name}! ¿Cómo estás? Contame en qué te puedo dar una mano hoy con tu alimentación.`,
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
    default: `Todo bien, contame más así te ayudo mejor con recetas o dudas puntuales.`
  },

  motivador: {
    greeting: (name) => `¡Vamos${name}! 💪 Soy tu asistente de Nutrio y estoy para ayudarte a cumplir tus objetivos. ¡Contame cómo la estás rompiendo hoy con la comida!`,
    saludo: (name) => `¡Buenísimo que estés acá${name}! Cada consulta suma. ¿En qué te ayudo hoy?`,
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
    default: `¡Dale que vamos bien! Contame más para seguir ayudándote a cumplir tu objetivo.`
  },

  tecnico: {
    greeting: (name) => `Hola${name}. Soy el asistente de Nutrio. Indicame tu consulta sobre alimentación, plan calórico o recetas y te doy una respuesta puntual.`,
    saludo: (name) => `Hola${name}. ¿En qué puedo asistirte hoy?`,
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
    default: `Indicame más detalles de tu consulta para poder responderte con precisión.`
  },

  humor: {
    greeting: (name) => `¡Eh${name}! 🥑 Acá tu asistente de Nutrio reportándose, listo para hablar de comida en serio (y de vez en cuando en broma). ¿Qué se te antoja saber hoy?`,
    saludo: (name) => `¡Qué onda${name}! Llegaste al lugar correcto para hablar de kcal sin sufrir. ¿En qué te ayudo?`,
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
    default: `Contame un poco más, que con media pregunta ni yo ni la heladera sabemos bien qué hacer.`
  }
};

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
    const msg = userMessage.toLowerCase();
    const persona = this._getPersona(profile);
    const name = profile && profile.name ? `, ${profile.name}` : '';

    if (msg.includes('hola') || msg.includes('buen')) {
      return persona.saludo(name);
    }
    if (msg.includes('dieta') || msg.includes('calorias') || msg.includes('calorías') || msg.includes('kcal')) {
      return persona.dieta(profile && profile.targetKcal ? profile.targetKcal : null);
    }
    if (msg.includes('agua') || msg.includes('hidrat')) {
      return persona.agua(profile && profile.waterGlasses ? profile.waterGlasses : null);
    }
    if (msg.includes('receta') || msg.includes('cocinar') || msg.includes('comer')) {
      const restr = profile && profile.restrictions && profile.restrictions.length
        ? profile.restrictions.join(', ')
        : null;
      return persona.receta(restr);
    }
    if (msg.includes('no me gusta') || msg.includes('alerg') || msg.includes('evitar')) {
      return persona.evitar;
    }
    return persona.default;
  }
};
