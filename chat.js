const ChatApp = {
  // Frases de transición para armar las respuestas dinámicas
  responsesDB: {
    saludos: {
      intros: ["¡Hola", "Buenas", "Cómo va", "Qué tal", "Un gusto saludarte"],
      cierres: [
        "¿En qué te puedo dar una mano con tu alimentación hoy?",
        "¿Qué cocinamos hoy? Contame qué tenés en mente.",
        "Estoy listo para ayudarte a armar tu día nutricional. ¿Qué necesitás?",
        "¿Analizamos alguna receta o vemos tus metas?"
      ]
    },
    calorias: {
      intros: ["Estuve revisando tus números.", "Según tus datos de peso, altura y desgaste,", "Para cumplir tu objetivo de manera eficiente,"],
      desarrollo: ["tu meta ideal está en **{kcal} kcal** diarios.", "deberíamos apuntar a unas **{kcal} kcal** por jornada."],
      cierres: ["Podés chequear cómo se divide esto en las pestañas Inicio y Semana.", "¡Con constancia vas a ver que llegás bárbaro a ese número!"]
    },
    defecto: [
      "Entendido perfectamente. Contame un poco más sobre eso así te tiro un centro.",
      "Me gusta la idea. ¿Querés que busquemos una opción para el almuerzo o la cena?",
      "Tomando nota. ¿Tiene que ver con tus calorías diarias o buscás una receta?",
      "Dejame pensar... Contame qué ingredientes tenés a mano en la heladera y vemos qué sale."
    ]
  },

  _random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // Método auxiliar para buscar recetas válidas según el perfil del usuario (igual al de tu UI)
  _getValidRecipesForCategory(category, profile) {
    // Si por alguna razón no hay perfil, devolvemos las de la DB global sin filtrar
    if (!profile) return RECIPES_DB.filter(r => r.category === category);

    return RECIPES_DB.filter(recipe => {
      if (recipe.category !== category) return false;

      // 1. Filtro de restricciones (Vegano, Vegetariano, etc.)
      if (profile.restrictions && profile.restrictions.length > 0) {
        const matchesAll = profile.restrictions.every(rest => recipe.tags.includes(rest));
        if (!matchesAll) return false;
      }

      // 2. Filtro de Alergias y Disgustos
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
    const msg = userMessage.toLowerCase();
    const name = profile && profile.name ? ` ${profile.name}` : '';

    // --- 1. DETECCIÓN DE PREGUNTAS DE COMIDA / RECETAS (LA MEJORA) ---
    if (msg.includes('cenar') || msg.includes('cena') || msg.includes('almorzar') || msg.includes('almuerzo') || msg.includes('desayuno') || msg.includes('desayunar') || msg.includes('merienda') || msg.includes('merendar') || msg.includes('comer') || msg.includes('cocinar') || msg.includes('receta')) {
      
      let categoriaBuscada = '';
      let momentoDelDia = '';

      if (msg.includes('desayno') || msg.includes('desayunar') || msg.includes('desayuno')) {
        categoriaBuscada = 'desayuno';
        momentoDelDia = 'un desayuno';
      } else if (msg.includes('almuerzo') || msg.includes('almorzar')) {
        categoriaBuscada = 'almuerzo';
        momentoDelDia = 'un almuerzo';
      } else if (msg.includes('merienda') || msg.includes('merendar')) {
        categoriaBuscada = 'meriendas'; // Tu DB usa 'meriendas' en plural
        momentoDelDia = 'una merienda';
      } else if (msg.includes('cena') || msg.includes('cenar')) {
        categoriaBuscada = 'cena';
        momentoDelDia = 'una cena';
      } else {
        // Si dice "qué puedo comer hoy" en general, adivinamos según la hora real del dispositivo
        const hora = new Date().getHours();
        if (hora >= 6 && hora < 12) { categoriaBuscada = 'desayuno'; momentoDelDia = 'un desayuno para arrancar el día'; }
        else if (hora >= 12 && hora < 16) { categoriaBuscada = 'almuerzo'; momentoDelDia = 'un almuerzo potente'; }
        else if (hora >= 16 && hora < 20) { categoriaBuscada = 'meriendas'; momentoDelDia = 'una merienda rica'; }
        else { categoriaBuscada = 'cena'; momentoDelDia = 'una cena liviana'; }
      }

      // Buscamos las opciones reales que el usuario SÍ puede comer
      const opcionesAptas = this._getValidRecipesForCategory(categoriaBuscada, profile);

      if (opcionesAptas.length > 0) {
        // Elegimos dos opciones al azar para darle variedad
        const opcion1 = this._random(opcionesAptas);
        // Intentamos que la opción 2 sea distinta si hay más de una disponible
        let opcion2 = this._random(opcionesAptas);
        if (opcionesAptas.length > 1 && opcion1.id === opcion2.id) {
          opcionesAptas.forEach(r => { if(r.id !== opcion1.id) opcion2 = r; });
        }

        const introsRecetas = [
          `¡Perfecto! Pensando en tu perfil, para hoy te sugiero **{momento}**.`,
          `Mirá, basándome en tus metas y restricciones, acá tenés buenas opciones para **{momento}**:`,
          `Chequeando tu menú personalizado, se me ocurrieron estas ideas para **{momento}**:`
        ];

        let respuesta = this._random(introsRecetas).replace('{momento}', momentoDelDia);
        
        respuesta += `<br><br>• <b>Opción 1:</b> ${opcion1.name} (${opcion1.kcal} kcal). <br><i>Ingredientes: ${opcion1.ingredients.join(', ')}</i>`;
        
        if (opcionesAptas.length > 1) {
          respuesta += `<br><br>• <b>Opción 2:</b> ${opcion2.name} (${opcion2.kcal} kcal). <br><i>Ingredientes: ${opcion2.ingredients.join(', ')}</i>`;
        }

        respuesta += `<br><br>¿Te copa alguna de estas opciones o preferís que busquemos otra cosa?`;
        return respuesta;
      } else {
        return `Estuve buscando ideas de tipo ${categoriaBuscada} para sugerirte, pero parece que tus filtros o alergias excluyen las opciones que tengo cargadas en la base de datos por ahora. ¿Querés que ignoremos las restricciones por un momento?`;
      }
    }

    // --- 2. GESTIÓN DE SALUDOS ---
    if (msg.includes('hola') || msg.includes('buen') || msg.includes('saludo')) {
      const intro = this._random(this.responsesDB.saludos.intros) + name + "!";
      const cierre = this._random(this.responsesDB.saludos.cierres);
      return `${intro} ${cierre}`;
    }

    // --- 3. GESTIÓN DE CALORÍAS / DIETA ---
    if (msg.includes('dieta') || msg.includes('calorias') || msg.includes('kcal') || msg.includes('peso') || msg.includes('ganar') || msg.includes('bajar')) {
      if (profile && profile.targetKcal) {
        const intro = this._random(this.responsesDB.calorias.intros);
        const des = this._random(this.responsesDB.calorias.desarrollo).replace('{kcal}', profile.targetKcal);
        const cierre = this._random(this.responsesDB.calorias.cierres);
        return `${intro} ${des} ${cierre}`;
      }
      return "Para calcular tus calorías exactas primero necesito que guardes tus datos en la pantalla de registro.";
    }

    // --- 4. GESTIÓN DE ALERGIAS O GUSTOS ---
    if (msg.includes('no me gusta') || msg.includes('alerg') || msg.includes('evitar') || msg.includes('asco') || msg.includes('odio')) {
      const todasLasRestricciones = [];
      if (profile?.allergies?.length) todasLasRestricciones.push(...profile.allergies);
      if (profile?.dislikes?.length) todasLasRestricciones.push(...profile.dislikes);
      if (profile?.restrictions?.length) todasLasRestricciones.push(...profile.restrictions);

      if (todasLasRestricciones.length > 0) {
        return `Desocupate por eso. Ya sé que sos alérgico o preferís evitar: <b>${todasLasRestricciones.join(', ')}</b>. Ninguna de las recetas que te voy a proponer acá en el chat va a llevar esos ingredientes.`;
      }
      return "Si hay algún alimento que te caiga mal o quieras evitar, acordate que podés ponerlo en tu Perfil reiniciando la app.";
    }

    // --- 5. RESPUESTA POR DEFECTO ---
    return this._random(this.responsesDB.defecto);
  }
};
