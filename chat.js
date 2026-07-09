const ChatApp = {
  // profile es opcional: si se pasa, el bot puede responder de forma más personalizada
  getBotResponse(userMessage, profile) {
    const msg = userMessage.toLowerCase();

    if (msg.includes('hola') || msg.includes('buen')) {
      const name = profile && profile.name ? `, ${profile.name}` : '';
      return `¡Hola${name}! Soy tu asistente de Nutrio. ¿En qué te puedo ayudar con tu alimentación hoy?`;
    }

    if (msg.includes('dieta') || msg.includes('calorias') || msg.includes('kcal')) {
      if (profile && profile.targetKcal) {
        return `Tu meta diaria calculada es de ${profile.targetKcal} kcal, según tu peso, altura y nivel de actividad. La podés revisar en la pestaña de Perfil.`;
      }
      return "Para cumplir tus metas te recomiendo seguir el plan diario de calorías que calculamos en tu pestaña de Perfil.";
    }

    if (msg.includes('receta') || msg.includes('cocinar') || msg.includes('comer')) {
      if (profile && profile.restrictions && profile.restrictions.length) {
        return `Ya tengo en cuenta tus preferencias (${profile.restrictions.join(', ')}). Revisá la pestaña Inicio o Semana, ahí armé opciones que se adaptan a eso.`;
      }
      return "Podés revisar la pestaña de Inicio o Semana, ahí preparé opciones personalizadas para tu objetivo.";
    }

    if (msg.includes('no me gusta') || msg.includes('alerg') || msg.includes('evitar')) {
      return "Podés actualizar los ingredientes que no te gustan volviendo a completar tu perfil desde la pestaña Perfil > Reiniciar Aplicación.";
    }

    return "Entendido. Contame más sobre tus dudas o consultame por recetas específicas para adaptarme a lo que necesitás.";
  }
};
