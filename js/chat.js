const ChatApp = {
  getBotResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    if (msg.includes('hola') || msg.includes('buen')) {
      return "¡Hola! Soy tu asistente de Nutrio. ¿En qué te puedo ayudar con tu alimentación hoy?";
    }
    if (msg.includes('dieta') || msg.includes('calorias') || msg.includes('kcal')) {
      return "Para cumplir tus metas te recomiendo seguir el plan diario de calorías que calculamos en tu pestaña de Perfil.";
    }
    if (msg.includes('receta') || msg.includes('cocinar') || msg.includes('comer')) {
      return "Podés revisar la pestaña de Recetas, ahí preparé opciones personalizadas para tu objetivo.";
    }
    return "Entendido. Contame más sobre tus dudas o consultame por recetas específicas para adaptarme a lo que necesitás.";
  }
};
