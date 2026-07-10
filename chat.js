const ChatApp = {
  // Diccionario de sinónimos y modismos latinoamericanos agrupados por "Intención"
  diccionario: {
    desayuno: [
      'desayuno', 'desayunar', 'mañana', 'arrancar el dia', 'desayuno',
      'tinto', 'cafecito', 'desayunito'
    ],
    almuerzo: [
      'almuerzo', 'almorzar', 'comida', 'comer', 'almorzito', 'mediodia', 
      'plato fuerte', 'lonche', 'ganso'
    ],
    merienda: [
      'merienda', 'merendar', 'tarde', 'mate', 'mates', 'matear', 'cafecito',
      'la once', 'onces', 'picar', 'snack', 'antojo', 'entretiempo'
    ],
    cena: [
      'cena', 'cenar', 'comida de la noche', 'nocturno', 'cenita'
    ],
    calorias: [
      'dieta', 'calorias', 'kcal', 'peso', 'ganar', 'bajar', 'adelgazar', 
      'engordar', 'musculo', 'nutricion', 'meta', 'requerimiento', 'deficit'
    ],
    restricciones: [
      'no me gusta', 'alerg', 'evitar', 'asco', 'odio', 'intolerante', 
      'sin gluten', 'sin lactosa', 'vegano', 'vegetariano', 'quitar'
    ],
    saludos: [
      'hola', 'buen', 'saludo', 'que tal', 'como va', 'onda', 'buenas', 
      'quiubo', 'epale', 'parce', 'che'
    ]
  },

  responsesDB: {
    saludos: {
      intros: ["¡Hola!", "¡Buenas!", "¡Cómo va!", "¡Qué tal!", "¡Un gusto saludarte!"],
      cierres: [
        "¿En qué te puedo dar una mano con tu alimentación hoy?",
        "¿Qué cocinamos? Contame qué tenés en mente.",
        "Estoy listo para ayudarte a organizar tu menú. ¿Qué necesitás?",
        "¿Revisamos alguna receta o vemos tus metas diarias?"
      ]
    },
    calorias: {
      intros: ["Estuve revisando tus números.", "Según tus datos de perfil,", "Para cumplir tu objetivo de forma eficiente,"],
      desarrollo: ["tu requerimiento ideal está en **{kcal} kcal** diarias.", "deberíamos apuntar a unas **{kcal} kcal** por jornada."],
      cierres: ["Podés chequear cómo se divide esto en las pestañas Inicio y Semana.", "¡Con constancia vas a ver que llegás bárbaro a ese número!"]
    },
    defecto: [
      "Entendido. Contame un poco más sobre lo que buscás así te tiro una idea exacta.",
      "Me gusta la idea. ¿Querés que busquemos una opción para el almuerzo, la cena o para picar algo?",
      "Tomando nota. ¿Tiene que ver con tus calorías diarias o buscás una receta en específico?",
      "Dejame pensar... Contame qué ingredientes tenés a mano y vemos qué sale."
    ]
  },

  _random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // Verifica si el mensaje del usuario contiene alguna de las palabras clave del grupo
  _matchIntent(msg, keywordsArray) {
    return keywordsArray.some(keyword => msg.includes(keyword));
  },

  _getValidRecipesForCategory(category, profile) {
    if (!profile) return RECIPES_DB.filter(r => r.category === category);

    return RECIPES_DB.filter(recipe => {
      if (recipe.category !== category) return false;

      if (profile.restrictions && profile.restrictions.length > 0) {
        const matchesAll = profile.restrictions.every(rest => recipe.tags.includes(rest));
        if (!matchesAll) return false;
      }

      const matchesAllergies = profile.allergies.some(allergy => 
        recipe.ingredients.some(ing => ing.toLowerCase().includes(allergy))
      );
      if (matchesAllergies) return false;

      const matchesDislikes = profile.dislikes.some(dislike => 
        recipe.ingredients.some(ing => ing.toLowerCase().includes(dislike))
      );
      if (matchesDislikes) return false;

      return true;
    });
  },

  getBotResponse(userMessage, profile) {
    const msg = userMessage.toLowerCase().trim();
    const name = profile && profile.name ? ` ${profile.name}` : '';

    // 1. EVALUACIÓN DE CATEGORÍAS DE COMIDA (Regionalismos cruzados)
    const quiereDesayuno = this._matchIntent(msg, this.diccionario.desayuno);
    const quiereAlmuerzo = this._matchIntent(msg, this.diccionario.almuerzo);
    const quiereMerienda = this._matchIntent(msg, this.diccionario.merienda);
    const quiereCena = this._matchIntent(msg, this.diccionario.cena);

    // Si el usuario nombró algo que tenga que ver con comer/cocinar/recetas o cualquiera de los de arriba
    if (quiereDesayuno || quiereAlmuerzo || quiereMerienda || quiereCena || msg.includes('receta') || msg.includes('cocinar') || msg.includes('platillo')) {
      
      let categoriaBuscada = '';
      let momentoDelDia = '';

      // Asignación directa por palabra clave detectada
      if (quiereDesayuno) {
        categoriaBuscada = 'desayuno';
        momentoDelDia = 'un desayuno espectacular';
      } else if (quiereAlmuerzo) {
        categoriaBuscada = 'almuerzo';
        momentoDelDia = 'un buen almuerzo (tu comida principal)';
      } else if (quiereMerienda) {
        categoriaBuscada = 'meriendas'; 
        momentoDelDia = 'una merienda, un snack o algo rico para acompañar el mate/café';
      } else if (quiereCena) {
        categoriaBuscada = 'cena';
        momentoDelDia = 'una cena equilibrada';
      } else {
        // SOSIEGO HORARIO: Si dice "qué como" sin especificar, decide por el reloj del dispositivo
        const hora = new Date().getHours();
        if (hora >= 6 && hora < 12) { categoriaBuscada = 'desayuno'; momentoDelDia = 'el desayuno de hoy'; }
        else if (hora >= 12 && hora < 16) { categoriaBuscada = 'almuerzo'; momentoDelDia = 'el almuerzo del mediodía'; }
        else if (hora >= 16 && hora < 20) { categoriaBuscada = 'meriendas'; momentoDelDia = 'algo rico para la tarde'; }
        else { categoriaBuscada = 'cena'; momentoDelDia = 'la cena de esta noche'; }
      }

      const opcionesAptas = this._getValidRecipesForCategory(categoriaBuscada, profile);

      if (opcionesAptas.length > 0) {
        const opcion1 = this._random(opcionesAptas);
        let opcion2 = this._random(opcionesAptas);
        if (opcionesAptas.length > 1 && opcion1.id === opcion2.id) {
          opcionesAptas.forEach(r => { if(r.id !== opcion1.id) opcion2 = r; });
        }

        const introsRecetas = [
          `¡Perfecto! Revisando tu perfil y tus metas, para **{momento}** te sugiero esto:`,
          `¡De una! Ideales para **{momento}** tenés estas opciones en tu plan:`,
          `Chequeando tus opciones personalizadas para **{momento}**, mirá lo que encontré:`
        ];

        let respuesta = this._random(introsRecetas).replace('{momento}', momentoDelDia);
        respuesta += `<br><br>• <b>Opción 1:</b> ${opcion1.name} (${opcion1.kcal} kcal). <br><i>Ingredientes: ${opcion1.ingredients.join(', ')}</i>`;
        
        if (opcionesAptas.length > 1) {
          respuesta += `<br><br>• <b>Opción 2:</b> ${opcion2.name} (${opcion2.kcal} kcal). <br><i>Ingredientes: ${opcion2.ingredients.join(', ')}</i>`;
        }

        respuesta += `<br><br>¿Te convence alguna opción o prefís buscar otra cosa?`;
        return respuesta;
      } else {
        return `Estuve buscando ideas para tu perfil, pero tus restricciones o los alimentos que decidiste evitar bloquean las recetas de esta categoría. ¿Querés que probemos con otra comida?`;
      }
    }

    // 2. GESTIÓN DE SALUDOS
    if (this._matchIntent(msg, this.diccionario.saludos)) {
      const intro = this._random(this.responsesDB.saludos.intros) + name;
      const cierre = this._random(this.responsesDB.saludos.cierres);
      return `${intro} ${cierre}`;
    }

    // 3. GESTIÓN DE CALORÍAS / METAS
    if (this._matchIntent(msg, this.diccionario.calorias)) {
      if (profile && profile.targetKcal) {
        const intro = this._random(this.responsesDB.calorias.intros);
        const des = this._random(this.responsesDB.calorias.desarrollo).replace('{kcal}', profile.targetKcal);
        const cierre = this._random(this.responsesDB.calorias.cierres);
        return `${intro} ${des} ${cierre}`;
      }
      return "Para calcular tus calorías exactas primero necesito que completes tus datos en la pantalla de registro.";
    }

    // 4. GESTIÓN DE ALERGIAS, DISGUSTOS O RESTRICCIONES
    if (this._matchIntent(msg, this.diccionario.restricciones)) {
      const todasLasRestricciones = [];
      if (profile?.allergies?.length) todasLasRestricciones.push(...profile.allergies);
      if (profile?.dislikes?.length) todasLasRestricciones.push(...profile.dislikes);
      if (profile?.restrictions?.length) todasLasRestricciones.push(...profile.restrictions);

      if (todasLasRestricciones.length > 0) {
        return `Desocupate, ya tengo anotado en tu perfil que preferís evitar: <b>${todasLasRestricciones.join(', ')}</b>. Todo plato que te recomiende por acá va a estar libre de eso.`;
      }
      return "Si tenés alergias o alimentos que no te gustan, recordá que podés cargarlos reiniciando tu perfil desde la configuración.";
    }

    // 5. RESPUESTA POR DEFECTO ALEATORIA
    return this._random(this.responsesDB.defecto);
  }
};
