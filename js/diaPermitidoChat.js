// diaPermitidoChat.js
// Hook para el ChatApp: detecta pedidos de trago/permitido y arma la respuesta,
// usando MealEngine + TRAGOS_DB/PERMITIDOS_DB (cheatDayDB.js) como única fuente de datos.
//
// Requiere cargar en orden: recipesDB.js (RECIPES_DB + MealEngine) -> cheatDayDB.js -> este archivo.
//
// A diferencia de MealEngine.isCheatDay (que es automático los domingos y afecta
// el PLAN semanal), este módulo permite además la activación MANUAL por chat
// ("no estoy a dieta", "quiero un trago", etc.) cualquier día de la semana,
// para pedidos puntuales que no tocan el plan armado.

const DiaPermitidoChat = {
  modoActivo: false,

  gatillosActivacion: [
    'no estoy a dieta', 'no estoy haciendo dieta', 'dia libre', 'día libre',
    'cheat day', 'cheat meal', 'me quiero relajar', 'quiero un gustito',
    'no quiero comer sano', 'hoy quiero comer mal', 'salgo esta noche',
    'tengo un asado', 'hay un cumple', 'hay una previa'
  ],
  gatillosDesactivacion: [
    'volvi a la dieta', 'volví a la dieta', 'segui con el plan', 'seguí con el plan',
    'modo dieta', 'terminó el día libre', 'termino el dia libre'
  ],
  gatillosTrago: ['trago', 'tragos', 'coctel', 'cóctel', 'que tomo', 'qué tomo', 'mocktail'],
  gatillosPermitido: ['permitido', 'permitidos', 'algo dulce', 'algo salado', 'antojo', 'snack'],

  _normalizar(t) {
    return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },
  _incluyeAlguno(t, lista) {
    return lista.some(g => t.includes(this._normalizar(g)));
  },

  // Devuelve true si hay que interceptar el mensaje (activación, desactivación,
  // o pedido de trago/permitido con el modo ya activo, o directamente si es domingo).
  detectar(mensaje, date = new Date()) {
    const t = this._normalizar(mensaje);
    const esDomingo = MealEngine.isCheatDay(date);

    if (this._incluyeAlguno(t, this.gatillosDesactivacion)) {
      this.modoActivo = false;
      return true;
    }
    if (this._incluyeAlguno(t, this.gatillosActivacion)) {
      this.modoActivo = true;
      return true;
    }
    if ((this.modoActivo || esDomingo) &&
        (this._incluyeAlguno(t, this.gatillosTrago) || this._incluyeAlguno(t, this.gatillosPermitido))) {
      return true;
    }
    return false;
  },

  _formatearTrago(trago) {
    return `🍹 *${trago.name}*\n` +
      `Ingredientes: ${trago.ingredients.join(', ')}\n` +
      `Preparación: ${trago.instructions.join(' ')}`;
  },
  _formatearPermitido(receta) {
    return `🍽️ *${receta.name}* (${receta.kcal} kcal aprox.)\n` +
      `Ingredientes: ${receta.ingredients.join(', ')}\n` +
      `Preparación: ${receta.instructions.join(' ')}`;
  },

  // profile: el mismo objeto de perfil que usás en MealEngine (con allergies,
  // restrictions, dislikes, etc.) para que el trago/permitido respete siempre
  // alergias y restricciones dietarias del usuario.
  responder(mensaje, profile, date = new Date()) {
    const t = this._normalizar(mensaje);

    if (this._incluyeAlguno(t, this.gatillosDesactivacion)) {
      return '¡Buenísimo! 💪 Volvemos al plan de siempre. Cualquier antojo, avisame.';
    }

    if (this._incluyeAlguno(t, this.gatillosTrago)) {
      let tipo = null;
      if (t.includes('sin alcohol') || t.includes('mocktail')) tipo = 'sin_alcohol';
      if (t.includes('con alcohol') || t.includes('alcoholico') || t.includes('alcohólico')) tipo = 'con_alcohol';

      const trago = MealEngine.getTragoDelDia(profile, date, tipo);
      if (!trago) return 'No encontré un trago que respete tus restricciones/alergias hoy. ¿Querés que te sugiera igual algo suave?';
      return `Dale, a disfrutar 🥳\n\n${this._formatearTrago(trago)}\n\nAcordate de hidratarte con agua también.`;
    }

    if (this._incluyeAlguno(t, this.gatillosPermitido)) {
      let categoria = null;
      if (t.includes('dulce')) categoria = 'dulce';
      if (t.includes('salado')) categoria = 'salado';

      const receta = MealEngine.getPermitidoDelDia(profile, date, categoria);
      if (!receta) return 'No encontré un permitido que respete tus restricciones/alergias hoy.';
      return `Hoy va el gustito 😋\n\n${this._formatearPermitido(receta)}`;
    }

    // Activación genérica: tira una idea de cada uno
    const trago = MealEngine.getTragoDelDia(profile, date);
    const permitido = MealEngine.getPermitidoDelDia(profile, date);
    return `Modo día permitido activado 🎉 Disfrutá tranquilo/a.\n\n` +
      `${this._formatearTrago(trago)}\n\n---\n\n${this._formatearPermitido(permitido)}\n\n` +
      `Cuando quieras volver al plan, avisame nomás.`;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DiaPermitidoChat };
}
