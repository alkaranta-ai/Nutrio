const ChatApp = {
  // Banco de datos modular para generar miles de combinaciones de respuestas
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
      intros: [
        "Estuve revisando tus números.",
        "Según tus datos de peso, altura y desgaste,",
        "Para cumplir tu objetivo de manera eficiente,",
        "Haciendo el cálculo matemático para tu cuerpo,"
      ],
      desarrollo: [
        "tu meta ideal está en **{kcal} kcal** diarios.",
        "deberíamos apuntar a unas **{kcal} kcal** por jornada.",
        "el balance perfecto para vos son **{kcal} kcal** al día."
      ],
      cierres: [
        "Podés chequear cómo se divide esto en las pestañas Inicio y Semana.",
        "Asegurate de repartir bien estas energías entre tus comidas planeadas.",
        "Si sentís que es mucho o poco, recordá que podemos reajustar tu Perfil.",
        "¡Con constancia vas a ver que llegás bárbaro a ese número!"
      ]
    },
    recetas: {
      intros: [
        "Dale, hablemos de comida.",
        "Sobre ese tema, te armé algo especial.",
        "¡Excelente elección!",
        "Pensando en tus platos de la semana,"
      ],
      desarrollo: [
        "en tu pestaña de **Inicio** ya tenés el menú seleccionado del día.",
        "si te fijás en la sección **Semana**, te dejé un cronograma completo.",
        "el algoritmo ya bloqueó opciones riquísimas que respetan tus gustos."
      ],
      cierres: [
        "¿Hay algún ingrediente en particular que quieras cambiar?",
        "Recordá que la lista con todo lo que necesitás comprar ya está lista en el Carrito.",
        "Tratá de respetar los pasos de cocción para que quede de diez.",
        "¿Te gustaría que busquemos una alternativa ligera o algo más contundente?"
      ]
    },
    restricciones: {
      intros: [
        "Anotadísimo.",
        "No te preocupes por eso,",
        "Qué bueno que me avises,"
      ],
      desarrollo: [
        "mi sistema ya sabe que preferís evitar ingredientes como **{evita}**.",
        "tengo bajo llave tus filtros especiales: **{evita}**.",
        "ninguna de las comidas que te sugerí contiene **{evita}**."
      ],
      cierres: [
        "Si cambiás de idea o hay algo nuevo que quieras esquivar, reiniciá tu perfil desde tu panel.",
        "Tu salud y comodidad con el menú son lo primero.",
        "Podés quedarte con total tranquilidad con el plan actual."
      ]
    },
    defecto: [
      "Entendido perfectamente. Contame un poco más sobre eso así te tiro un centro.",
      "Me gusta la idea. ¿Querés que lo adaptemos a tu almuerzo o a la cena?",
      "Tomando nota. ¿Tiene que ver con tus calorías diarias o buscás una receta?",
      "Dejame pensar... Contame qué ingredientes tenés a mano en la heladera y vemos qué sale.",
      "Buen punto. Recordá que todo lo que planifiquemos impacta directo en tu meta de la pestaña Perfil."
    ]
  },

  // Helper para sacar un elemento random de un array
  _random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  getBotResponse(userMessage, profile) {
    const msg = userMessage.toLowerCase();
    const name = profile && profile.name ? ` ${profile.name}` : '';
    
    // 1. GESTIÓN DE SALUDOS
    if (msg.includes('hola') || msg.includes('buen') || msg.includes('saludo')) {
      const intro = this._random(this.responsesDB.saludos.intros) + name + "!";
      const cierre = this._random(this.responsesDB.saludos.cierres);
      return `${intro} ${cierre}`;
    }

    // 2. GESTIÓN DE CALORÍAS / DIETA
    if (msg.includes('dieta') || msg.includes('calorias') || msg.includes('kcal') || msg.includes('peso') || msg.includes('ganar') || msg.includes('bajar')) {
      if (profile && profile.targetKcal) {
        const intro = this._random(this.responsesDB.calorias.intros);
        const des = this._random(this.responsesDB.calorias.desarrollo).replace('{kcal}', profile.targetKcal);
        const cierre = this._random(this.responsesDB.calorias.cierres);
        return `${intro} ${des} ${cierre}`;
      }
      return "Para calcular tus calorías exactas primero necesito que guardes tus datos en la pantalla de registro.";
    }

    // 3. GESTIÓN DE ALERGIAS O DISGUSTOS
    if (msg.includes('no me gusta') || msg.includes('alerg') || msg.includes('evitar') || msg.includes('asco') || msg.includes('odio')) {
      const todasLasRestricciones = [];
      if (profile?.allergies?.length) todasLasRestricciones.push(...profile.allergies);
      if (profile?.dislikes?.length) todasLasRestricciones.push(...profile.dislikes);
      if (profile?.restrictions?.length) todasLasRestricciones.push(...profile.restrictions);

      if (todasLasRestricciones.length > 0) {
        const listaEvitar = todasLasRestricciones.join(', ');
        const intro = this._random(this.responsesDB.restricciones.intros);
        const des = this._random(this.responsesDB.restricciones.desarrollo).replace('{evita}', listaEvitar);
        const cierre = this._random(this.responsesDB.restricciones.cierres);
        return `${intro} ${des} ${cierre}`;
      }
      return "Si hay algún alimento que te caiga mal o quieras evitar, acordate que podés ponerlo en tu Perfil reiniciando la app.";
    }

    // 4. GESTIÓN DE RECETAS / COCINA
    if (msg.includes('receta') || msg.includes('cocinar') || msg.includes('comer') || msg.includes('almuerzo') || msg.includes('cena') || msg.includes('desayuno') || msg.includes('merienda')) {
      const intro = this._random(this.responsesDB.recetas.intros);
      const des = this._random(this.responsesDB.recetas.desarrollo);
      const cierre = this._random(this.responsesDB.recetas.cierres);
      return `${intro} ${des} ${cierre}`;
    }

    // 5. RESPUESTA POR DEFECTO ALEATORIA
    return this._random(this.responsesDB.defecto);
  }
};
