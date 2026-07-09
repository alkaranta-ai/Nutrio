const ChatApp = {
  _normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  },

  _findCravingMatch(normalizedMsg) {
    let best = null;
    let bestScore = 0;
    RECIPES_DB.forEach((recipe) => {
      if (!recipe.keywords) return;
      let score = 0;
      recipe.keywords.forEach((kw) => {
        if (normalizedMsg.includes(this._normalize(kw))) score++;
      });
      if (score > bestScore) {
        bestScore = score;
        best = recipe;
      }
    });
    return best;
  },

  _formatRecipe(recipe, profile) {
    let out = `¡Buenísimo! Te propongo <b>${recipe.name}</b> (${recipe.kcal} kcal aprox).<br>`;
    out += `<b>Ingredientes:</b> ${recipe.ingredients.join(', ')}.`;
    if (recipe.instructions && recipe.instructions.length) {
      out += `<br><b>Preparación:</b> ${recipe.instructions.join(' ')}`;
    }

    if (profile && profile.goals && profile.goals[0]) {
      const goal = profile.goals[0];
      if (goal === 'bajar_peso' && recipe.kcal >= 450) {
        out += `<br><br>Como tu objetivo es bajar de peso, te sugiero una porción moderada y acompañarla con una ensalada bien verde para sumar volumen sin sumar muchas calorías.`;
      } else if (goal === 'subir_peso') {
        out += `<br><br>Como estás en etapa de subir de peso, podés sumarle una porción extra de proteína o un carbohidrato de acompañamiento para que rinda más calorías.`;
      } else if (goal === 'mantener') {
        out += `<br><br>Entra perfecto dentro de tu plan de mantenimiento, ¡disfrutala!`;
      }
    }
    return out;
  },

  getBotResponse(userMessage, profile) {
    const msg = this._normalize(userMessage);
    const name = profile && profile.name ? profile.name : null;

    const craving = this._findCravingMatch(msg);
    if (craving) {
      return this._formatRecipe(craving, profile);
    }

    if (/\b(hola|buen dia|buenas|buenos dias|buenas tardes|buenas noches|hey)\b/.test(msg)) {
      return name
        ? `¡Hola, ${name}! ¿Tenés ganas de algo en particular o te tiro una idea para tu próxima comida?`
        : `¡Hola! ¿Tenés ganas de algo en particular o te tiro una idea para tu próxima comida?`;
    }

    if (/\b(dieta|calorias|kcal|meta diaria|cuanto tengo que comer)\b/.test(msg)) {
      if (profile && profile.targetKcal) {
        return `Tu meta diaria está en ${profile.targetKcal} kcal aproximadamente. La podés ver siempre en la pestaña de Perfil. ¿Querés que te sugiera algo para completar el día?`;
      }
      return `Todavía no tengo tu meta calórica calculada. Completá tu perfil desde el botón "Reiniciar Aplicación" si querés volver a hacer el cuestionario.`;
    }

    if (/\b(tengo hambre|no se que comer|no se q comer|que como|algo para comer|sugerime algo|recomendame algo)\b/.test(msg)) {
      const pool = RECIPES_DB.filter(r => r.category !== 'antojo');
      const pick = pool[Math.floor(Math.random() * pool.length)];
      return `${name ? `Dale ${name}, ` : 'Dale, '}mirá esta opción: ${this._formatRecipe(pick, profile)}`;
    }

    if (/\b(receta|cocinar|comer)\b/.test(msg)) {
      return `Contame qué se te antoja (por ejemplo "quiero pizza", "algo dulce", "pollo", "pasta") y te paso una receta al toque. También podés revisar tu Plan Semanal para ver todo lo que tenés armado.`;
    }

    return `Contame con más detalle qué se te antoja comer (ej: "quiero una hamburguesa" o "algo dulce") y te tiro una receta pensada para vos.`;
  }
};
