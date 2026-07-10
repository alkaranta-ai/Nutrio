// ASISTENTE DE CHAT — ahora usa el perfil completo (no solo el nombre) para
// responder de forma personalizada: objetivo, condiciones de salud,
// restricciones, alergias, disgustos, y la comida del día resuelta por MealEngine.

const ChatApp = {

  _goalLabels: {
    bajar_peso: 'bajar de peso', mantener: 'mantener tu peso', subir_peso: 'subir de peso',
    ganar_musculo: 'ganar músculo', comer_saludable: 'comer más saludable'
  },
  _healthLabels: {
    colesterol_alto: 'tu colesterol alto', hipertension: 'tu hipertensión', diabetes: 'tu diabetes'
  },

  getBotResponse(userMessage, profile) {
    const msg = userMessage.toLowerCase();
    const name = profile && profile.name ? profile.name : null;

    // --- Saludo ---
    if (msg.includes('hola') || msg.includes('buen')) {
      return name
        ? `¡Hola, ${name}! Soy tu asistente de Nutrio. Estoy al tanto de tu perfil y tu objetivo de ${this._goalLabels[profile.goals?.[0]] || 'alimentación saludable'}. ¿En qué te ayudo hoy?`
        : `¡Hola! Soy tu asistente de Nutrio. ¿En qué te puedo ayudar con tu alimentación hoy?`;
    }

    // --- Qué comer hoy / ahora ---
    if (msg.includes('qué como') || msg.includes('que como') || msg.includes('hoy') || msg.includes('ahora')) {
      if (profile && typeof MealEngine !== 'undefined') {
        const today = new Date();
        let categoria = 'almuerzo';
        const hour = today.getHours();
        if (hour < 10) categoria = 'desayuno';
        else if (hour < 16) categoria = 'almuerzo';
        else if (hour < 19) categoria = 'meriendas';
        else categoria = 'cena';
        const meal = MealEngine.getMealForDate(categoria, profile, today);
        const label = CATEGORY_META[categoria] ? CATEGORY_META[categoria].label.toLowerCase() : categoria;
        return `Para tu ${label} de hoy te tengo pensado: ${meal.name} (${meal.kcal} kcal). Ya está adaptado a tus restricciones y evita lo que no te gusta. Lo podés ver en la pestaña Inicio.`;
      }
      return "Completá tu perfil primero así te puedo armar el plan del día.";
    }

    // --- Calorías / dieta ---
    if (msg.includes('dieta') || msg.includes('calorias') || msg.includes('calorías') || msg.includes('kcal')) {
      if (profile && profile.targetKcal) {
        let extra = '';
        if (profile.healthConditions && profile.healthConditions.length) {
          const conds = profile.healthConditions.map(h => this._healthLabels[h] || h).join(' y ');
          extra = ` Además, tengo en cuenta ${conds} para no sugerirte recetas que no te convengan.`;
        }
        return `Tu meta diaria calculada es de ${profile.targetKcal} kcal, según tu peso, altura, actividad y tu objetivo de ${this._goalLabels[profile.goals?.[0]] || 'alimentación saludable'}.${extra} La podés revisar en la pestaña de Perfil.`;
      }
      return "Para cumplir tus metas te recomiendo seguir el plan diario de calorías que calculamos en tu pestaña de Perfil.";
    }

    // --- Recetas / cocinar / comer ---
    if (msg.includes('receta') || msg.includes('cocinar') || msg.includes('comer')) {
      if (profile) {
        const bits = [];
        if (profile.restrictions && profile.restrictions.length) bits.push(`tus restricciones (${profile.restrictions.join(', ')})`);
        if (profile.allergies && profile.allergies.length) bits.push(`tus alergias (${profile.allergies.join(', ')})`);
        if (profile.dislikes && profile.dislikes.length) bits.push(`lo que no te gusta (${profile.dislikes.join(', ')})`);
        const detail = bits.length ? ` teniendo en cuenta ${bits.join(', ')}` : '';
        return `Ya armé las recetas de Inicio y Semana pensadas para vos${detail}, y orientadas a tu objetivo de ${this._goalLabels[profile.goals?.[0]] || 'alimentación saludable'}.`;
      }
      return "Podés revisar la pestaña de Inicio o Semana, ahí preparé opciones personalizadas para tu objetivo.";
    }

    // --- Disgustos / alergias / a evitar ---
    if (msg.includes('no me gusta') || msg.includes('alerg') || msg.includes('evitar')) {
      const current = profile && profile.dislikes && profile.dislikes.length
        ? ` Ahora mismo ya evito: ${profile.dislikes.join(', ')}.`
        : '';
      return `Podés actualizar los ingredientes que no te gustan volviendo a completar tu perfil desde la pestaña Perfil > Reiniciar Aplicación.${current}`;
    }

    // --- Objetivo / progreso ---
    if (msg.includes('objetivo') || msg.includes('meta') || msg.includes('progreso')) {
      if (profile && profile.goals && profile.goals[0]) {
        return `Tu objetivo activo es ${this._goalLabels[profile.goals[0]] || profile.goals[0]}. Todo el plan de comidas (Inicio y Semana) está armado para ayudarte a lograrlo.`;
      }
      return "Todavía no tengo tu objetivo cargado. Completá tu perfil para poder ayudarte mejor.";
    }

    // --- Genérico, pero personalizado si hay perfil ---
    if (name) {
      return `Entendido, ${name}. Contame más sobre tus dudas o consultame por recetas específicas para adaptarme a lo que necesitás.`;
    }
    return "Entendido. Contame más sobre tus dudas o consultame por recetas específicas para adaptarme a lo que necesitás.";
  }
};
