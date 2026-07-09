// ============================================================
// "IA" nutricional local — motor de reglas + base de datos.
// Funciona sin conexión ni claves de API: interpreta la intención
// del mensaje, consulta el perfil del usuario y la base de datos
// de alimentos/recetas, y responde en tono cercano de nutricionista.
// ============================================================

const NutriBot = {

  greet(profile) {
    const hora = new Date().getHours();
    const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
    return `${saludo}, ${profile.name.split(" ")[0]}. Soy tu nutricionista. Preguntame sobre alimentos, pedime una receta, o contame qué comiste y lo anoto en tu día. ¿En qué te ayudo?`;
  },

  reply(message, profile) {
    const q = normalize(message);

    // --- Registrar consumo: "comí 2 tortillas", "acabo de comer un huevo" ---
    const logMatch = q.match(/(?:com[ií]|comiendo|consum[ií]|acabo de comer)\s+(.+)/);
    if (logMatch) {
      return this.handleLog(logMatch[1], message);
    }

    // --- Consulta de calorías/macros de un alimento ---
    if (/cuant[ao]s?\s+(calor|prote|carbohidr|grasa|fibra)/.test(q) || /calorias? (tiene|de)/.test(q)) {
      return this.handleFoodQuery(q);
    }

    // --- Pedido de receta ---
    if (/receta|que (cocino|preparo|como)|dame algo para (comer|cenar|desayunar|almorzar)/.test(q)) {
      return this.handleRecipeRequest(q, profile);
    }

    // --- Resumen del día ---
    if (/como voy|resumen|cuanto llevo|mi progreso|mis macros/.test(q)) {
      return this.handleSummary(profile);
    }

    // --- Agua ---
    if (/agua|hidrat/.test(q)) {
      const targets = calcTargets(profile);
      return `Con tu peso actual, tu meta orientativa de agua es de unos ${(targets.water/1000).toFixed(1)} litros al día. Repartilo en pequeñas tomas y aumentalo si hace calor o entrenás fuerte.`;
    }

    // --- Peso / objetivo ---
    if (/bajar de peso|perder peso|adelgazar/.test(q)) {
      return "Para bajar de peso de forma sostenible conviene un déficit moderado (10-20% menos de tu gasto diario), priorizando proteína en cada comida para cuidar la masa muscular, y fibra de verduras y legumbres para la saciedad. Evitá los déficits muy agresivos, generan efecto rebote. ¿Querés que te arme un menú del día con tu meta calórica?";
    }
    if (/subir de peso|ganar peso|ganar musculo|aumentar masa/.test(q)) {
      return "Para ganar peso o masa muscular buscá un superávit moderado (10-15%), con proteína suficiente (1.6-2.2 g por kg de peso) repartida en varias comidas, y entrenamiento de fuerza. Los carbohidratos como arroz, papa, camote y avena te dan la energía para entrenar y recuperar.";
    }

    // --- Fibra / digestión ---
    if (/fibra|estreñ|digesti/.test(q)) {
      return "La fibra ayuda a la digestión y a la saciedad. Buenas fuentes en Latinoamérica: frijoles, lentejas, garbanzos, guayaba, avena y verduras de hoja. Se recomienda entre 25 y 30 g al día, y conviene aumentarla de a poco tomando suficiente agua.";
    }

    // --- Azúcar / sodio ---
    if (/azucar|dulce/.test(q)) {
      return "La OMS recomienda limitar el azúcar añadida a menos del 10% de tus calorías diarias (idealmente menos del 5%). Eso equivale más o menos a 25-50 g al día para una dieta de 2000 kcal. Cuidado con jugos envasados, gaseosas y panes dulces, suelen concentrar mucho azúcar oculto.";
    }
    if (/sodio|sal /.test(q) || q === "sal") {
      return "Se recomienda no superar los 2000 mg de sodio al día (unos 5 g de sal). En Latinoamérica hay que prestar atención a los quesos, embutidos, caldos en cubo y snacks salados, que concentran mucho sodio.";
    }

    // --- Vegetariano/vegano ---
    if (/vegetarian|vegano|sin carne/.test(q)) {
      return "Una dieta vegetariana o vegana bien planificada puede cubrir tus necesidades combinando legumbres (frijoles, lentejas, garbanzos) con cereales (arroz, maíz, quinoa) para lograr proteína completa, y sumando frutos secos, semillas y verduras de hoja verde por hierro y calcio. Puedo armarte un menú vegetariano si querés, decime.";
    }

    // saludo simple
    if (/^hola|buenas|hey|que tal/.test(q)) {
      return this.greet(profile);
    }

    if (/gracias/.test(q)) {
      return "¡De nada! Acá estoy para lo que necesites.";
    }

    // fallback general, intenta buscar alimento mencionado igual
    const food = this.findAnyFoodInText(q);
    if (food) {
      return this.describeFood(food);
    }

    return "No estoy segura de haber entendido bien. Puedo ayudarte con: información nutricional de un alimento ('¿cuántas calorías tiene el aguacate?'), recetas ('dame una receta alta en proteína'), registrar lo que comiste ('comí 2 huevos'), o tu resumen del día ('¿cómo voy hoy?').";
  },

  findAnyFoodInText(q) {
    return FOODS.find(f => q.includes(normalize(f.name)) || q.includes(normalize(f.id)));
  },

  describeFood(food) {
    return `${food.name} (por 100 g): ${food.kcal} kcal, ${food.protein} g de proteína, ${food.carbs} g de carbohidratos, ${food.fat} g de grasa y ${food.fiber} g de fibra.`;
  },

  handleFoodQuery(q) {
    const food = this.findAnyFoodInText(q);
    if (!food) {
      return "No encontré ese alimento en mi base de datos todavía. Probá con el nombre más simple, por ejemplo 'arroz', 'pollo' o 'aguacate'.";
    }
    return this.describeFood(food);
  },

  handleLog(text, original) {
    // intenta extraer cantidad + alimento, ej: "2 tortillas", "una taza de arroz"
    const numMatch = text.match(/(\d+(?:[.,]\d+)?)/);
    const qty = numMatch ? parseFloat(numMatch[1].replace(",", ".")) : 1;
    const food = this.findAnyFoodInText(normalize(text));
    if (!food) {
      return `Anoté "${original}" pero no reconocí el alimento exacto para calcular calorías. Podés buscarlo y agregarlo manualmente desde Inicio.`;
    }
    // asumimos porción de 100g por unidad simple si no se especifica, ajustable
    const grams = qty * 100;
    const factor = grams / 100;
    const entry = {
      name: food.name,
      grams,
      kcal: Math.round(food.kcal * factor),
      protein: Math.round(food.protein * factor),
      carbs: Math.round(food.carbs * factor),
      fat: Math.round(food.fat * factor),
    };
    Store.addLogEntry(entry);
    return `Listo, agregué ${qty} porción(es) de ${food.name} a tu registro de hoy (~${entry.kcal} kcal, ${entry.protein} g de proteína). Podés verlo y ajustarlo en Inicio.`;
  },

  handleRecipeRequest(q, profile) {
    let pool = RECIPES.slice();

    if (/desayun/.test(q)) pool = pool.filter(r => r.meal === "desayuno");
    else if (/almuerz|comida del mediodia/.test(q)) pool = pool.filter(r => r.meal === "almuerzo");
    else if (/cena|noche/.test(q)) pool = pool.filter(r => r.meal === "cena");
    else if (/snack|merienda/.test(q)) pool = pool.filter(r => r.meal === "snack");

    if (/proteina/.test(q)) pool = pool.filter(r => recipeMacros(r).protein >= 25).length ? pool.filter(r => recipeMacros(r).protein >= 25) : pool;
    if (/vegetarian/.test(q)) pool = pool.filter(r => r.tags.includes("vegetariano") || r.tags.includes("vegano"));
    if (/vegano/.test(q)) pool = pool.filter(r => r.tags.includes("vegano"));
    if (/sin gluten/.test(q)) pool = pool.filter(r => r.tags.includes("sin gluten"));

    if (profile.restrictions) {
      if (profile.restrictions.includes("vegetariano")) pool = pool.filter(r => r.tags.includes("vegetariano") || r.tags.includes("vegano"));
      if (profile.restrictions.includes("vegano")) pool = pool.filter(r => r.tags.includes("vegano"));
      if (profile.restrictions.includes("sin_gluten")) pool = pool.filter(r => r.tags.includes("sin gluten"));
    }

    if (!pool.length) pool = RECIPES;
    const recipe = pool[Math.floor(Math.random() * pool.length)];
    const macros = recipeMacros(recipe);
    return {
      text: `Te propongo: ${recipe.name} (${recipe.region}) — ${macros.kcal} kcal, ${macros.protein} g de proteína. Podés verla completa en la pestaña Recetas.`,
      recipeId: recipe.id,
    };
  },

  handleSummary(profile) {
    const targets = calcTargets(profile);
    const today = sumTodayMacros();
    const restante = Math.max(targets.kcal - today.kcal, 0);
    return `Hoy llevás ${today.kcal} de ${targets.kcal} kcal (te quedan ${restante} kcal), ${today.protein} g de proteína de ${targets.protein} g objetivo, ${today.carbs} g de carbohidratos y ${today.fat} g de grasa.`;
  },
};
