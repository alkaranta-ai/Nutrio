// ARMADO DE PERFIL — pantalla única, sin pasos.
//
// El formulario se completa y se valida en una sola pantalla con Onboarding.finish().
// RECIPES_DB y MealEngine viven en js/data.js (se carga antes que este archivo).

const Onboarding = {
  selected: {
    activity: null,
    goal: null,
    health: [],
    restrictions: [],
    mealsPerDay: null,
    cookTime: null,
    budget: null,
    cuisines: [],
    chatStyle: null
  },

  _bindSingleSelect(groupId, stateKey) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      this.selected[stateKey] = chip.dataset.val;
    });
  },

  _bindMultiSelect(groupId, stateKey, exclusiveVal) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const val = chip.dataset.val;
      const exclusive = exclusiveVal || 'ninguna';

      if (val === exclusive) {
        group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selected[stateKey] = [val];
        return;
      }

      chip.classList.toggle('active');
      const exclusiveChip = group.querySelector(`[data-val="${exclusive}"]`);
      if (exclusiveChip) exclusiveChip.classList.remove('active');

      const list = this.selected[stateKey].filter(v => v !== exclusive);
      const idx = list.indexOf(val);
      if (chip.classList.contains('active') && idx === -1) {
        list.push(val);
      } else if (!chip.classList.contains('active') && idx !== -1) {
        list.splice(idx, 1);
      }
      this.selected[stateKey] = list;
    });
  },

  bindAllChips() {
    this._bindSingleSelect('activityChips', 'activity');
    this._bindSingleSelect('goalChips', 'goal');
    this._bindMultiSelect('healthChips', 'health', 'ninguna');
    this._bindMultiSelect('restrictionChips', 'restrictions', 'ninguna');
    this._bindSingleSelect('mealsPerDayChips', 'mealsPerDay');
    this._bindSingleSelect('cookTimeChips', 'cookTime');
    this._bindSingleSelect('budgetChips', 'budget');
    this._bindMultiSelect('cuisineChips', 'cuisines', 'sin_preferencia');
    this._bindSingleSelect('chatStyleChips', 'chatStyle');
  },

  finish() {
    const errorBox = document.getElementById('onbError');
    const name = document.getElementById('fName').value.trim();
    const age = document.getElementById('fAge').value;
    const weight = document.getElementById('fWeight').value;
    const height = document.getElementById('fHeight').value;
    const sex = document.getElementById('fSex').value;
    const country = document.getElementById('fCountry').value;

    const missingRequired =
      !name || !age || !weight || !height ||
      !this.selected.activity || !this.selected.goal;
    const invalidNumbers =
      Number(age) <= 0 || Number(weight) <= 0 || Number(height) <= 0;

    if (missingRequired || invalidNumbers) {
      errorBox.classList.add('show');
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    errorBox.classList.remove('show');

    const allergiesRaw = document.getElementById('fAllergies').value.trim();
    const dislikesRaw = document.getElementById('fDislikes').value.trim();
    const favoriteFoodsRaw = document.getElementById('fFavoriteFoods').value.trim();
    const chatCustomRaw = document.getElementById('fChatCustom').value.trim();
    const waterVal = document.getElementById('fWaterGlasses').value;
    const sleepVal = document.getElementById('fSleepHours').value;

    const profile = {
      name,
      age: parseInt(age, 10),
      sex,
      weight: parseFloat(weight),
      height: parseFloat(height),
      country,
      activity: this.selected.activity,
      goals: [this.selected.goal],
      healthConditions: this.selected.health.filter(v => v !== 'ninguna'),
      allergies: allergiesRaw ? allergiesRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
      restrictions: this.selected.restrictions,
      dislikes: dislikesRaw ? dislikesRaw.split(',').map(s => s.trim()).filter(Boolean) : [],

      // Hábitos y rutina
      mealsPerDay: this.selected.mealsPerDay || '3',
      cookTime: this.selected.cookTime || 'moderado',
      budget: this.selected.budget || 'medio',
      waterGlasses: waterVal ? parseInt(waterVal, 10) : null,
      sleepHours: sleepVal ? parseFloat(sleepVal) : null,

      // Gustos
      cuisines: this.selected.cuisines.filter(v => v !== 'sin_preferencia'),
      favoriteFoods: favoriteFoodsRaw ? favoriteFoodsRaw.split(',').map(s => s.trim()).filter(Boolean) : [],

      // Estilo del chat
      chatStyle: this.selected.chatStyle || 'amigable',
      chatCustomNote: chatCustomRaw || ''
    };

    profile.targetKcal = this._calculateTargetKcal(profile);

    StorageApp.saveProfile(profile);
    UI.regenerateCartForWeek();
    UI.init();
  },

  // Fórmula de Mifflin-St Jeor + factor de actividad + ajuste según objetivo.
  _calculateTargetKcal(profile) {
    let tmb = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
    tmb = profile.sex === 'masculino' ? tmb + 5 : tmb - 161;

    const activityFactors = {
      sedentario: 1.2,
      ligero: 1.375,
      moderado: 1.55,
      activo: 1.725,
      muy_activo: 1.9
    };
    const factor = activityFactors[profile.activity] || 1.2;

    let targetKcal = Math.round(tmb * factor);

    const goal = profile.goals[0];
    if (goal === 'bajar_peso') targetKcal -= 400;
    if (goal === 'subir_peso') targetKcal += 400;
    if (goal === 'ganar_musculo') targetKcal += 300;
    // 'mantener' y 'comer_saludable' no ajustan las kcal base.

    return targetKcal;
  }
};

const UI = {
  init() {
    const profile = StorageApp.getProfile();
    if (!profile) {
      document.getElementById('onboarding').style.display = 'block';
      document.getElementById('app').style.display = 'none';
      Onboarding.bindAllChips();
      return;
    }

    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    this.renderHome();
    this.renderWeeklyPlan();
    this.renderCart();
    this.renderProfile();
    this.renderChatGreeting(profile);
    this.goto('chat'); // Abre el chat primero
  },

  goto(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.dock-item').forEach(b => b.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.classList.add('active');

    const viewsOrder = ['chat', 'inicio', 'semana', 'carrito', 'perfil'];
    const idx = viewsOrder.indexOf(viewName);
    const buttons = document.querySelectorAll('.dock-item');
    if (buttons[idx]) buttons[idx].classList.add('active');

    document.getElementById('chatInputBar').style.display = viewName === 'chat' ? 'block' : 'none';
  },

  // Primer mensaje del chat, adaptado al estilo elegido por el usuario en el onboarding.
  renderChatGreeting(profile) {
    const scroll = document.getElementById('chatScroll');
    if (!scroll || !profile) return;
    const greeting = ChatApp.getGreeting(profile);
    scroll.innerHTML = `<div style="text-align:left;"><span style="background:var(--bg); padding:8px 12px; border-radius:12px; display:inline-block;">${greeting}</span></div>`;
  },

  // Comidas de HOY, resueltas por MealEngine contra el perfil (restricciones,
  // alergias, condiciones de salud y calorías objetivo).
  renderHome() {
    const profile = StorageApp.getProfile();
    if (!profile) return;
    document.getElementById('homeGreeting').innerText = `¡Hola, ${profile.name}!`;
    document.getElementById('kcalDisplayTarget').innerText = `Tu requerimiento diario: ${profile.targetKcal} kcal / Objetivo Activo.`;

    const container = document.getElementById('dayMealsContainer');
    if (!container) return;

    const today = new Date();
    const breakfast = MealEngine.getMealForDate('desayuno', profile, today);
    const lunch = MealEngine.getMealForDate('almuerzo', profile, today);
    const snack = MealEngine.getMealForDate('meriendas', profile, today);
    const dinner = MealEngine.getMealForDate('cena', profile, today);

    container.innerHTML = `
      <div class="card">
        <div class="meal-slot"><div class="meal-title">Desayuno</div><h3>${breakfast.name}</h3><p style="font-size:13px; color:var(--text-muted);">${breakfast.kcal} kcal • ${breakfast.ingredients.join(', ')}</p></div>
        <div class="meal-slot"><div class="meal-title">Almuerzo</div><h3>${lunch.name}</h3><p style="font-size:13px; color:var(--text-muted);">${lunch.kcal} kcal • ${lunch.ingredients.join(', ')}</p></div>
        <div class="meal-slot"><div class="meal-title">Merienda</div><h3>${snack.name}</h3><p style="font-size:13px; color:var(--text-muted);">${snack.kcal} kcal • ${snack.ingredients.join(', ')}</p></div>
        <div class="meal-slot"><div class="meal-title">Cena</div><h3>${dinner.name}</h3><p style="font-size:13px; color:var(--text-muted);">${dinner.kcal} kcal • ${dinner.ingredients.join(', ')}</p></div>
      </div>
    `;
  },

  // Próximos 7 días, resueltos por MealEngine (no se repite una receta hasta
  // agotar el pool filtrado del perfil).
  renderWeeklyPlan() {
    const container = document.getElementById('weeklyPlanContainer');
    if (!container) return;

    const profile = StorageApp.getProfile();
    if (!profile) return;

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const plan = MealEngine.getPlanForDays(profile, new Date(), 7);

    container.innerHTML = plan.map(({ date, meals }) => {
      const dayLabel = dayNames[date.getDay()];
      return `
        <div class="card" style="margin-bottom:12px;">
          <h3 style="color:var(--primary); margin-bottom:6px;">${dayLabel}</h3>
          <p style="font-size:14px; color:var(--text);"><b>Desayuno:</b> ${meals.desayuno.name} (${meals.desayuno.kcal} kcal)</p>
          <p style="font-size:14px; color:var(--text); margin-top:2px;"><b>Almuerzo:</b> ${meals.almuerzo.name} (${meals.almuerzo.kcal} kcal)</p>
          <p style="font-size:14px; color:var(--text); margin-top:2px;"><b>Merienda:</b> ${meals.meriendas.name} (${meals.meriendas.kcal} kcal)</p>
          <p style="font-size:14px; color:var(--text); margin-top:2px;"><b>Cena:</b> ${meals.cena.name} (${meals.cena.kcal} kcal)</p>
        </div>
      `;
    }).join('');
  },

  // El carrito ahora sale de las comidas REALES de la semana (ya filtradas
  // por perfil), no de toda la base de datos entera.
  regenerateCartForWeek() {
    const profile = StorageApp.getProfile();
    if (!profile) return;
    const plan = MealEngine.getPlanForDays(profile, new Date(), 7);
    const itemsSet = new Set();
    plan.forEach(({ meals }) => {
      Object.values(meals).forEach(recipe => {
        recipe.ingredients.forEach(ing => itemsSet.add(ing));
      });
    });
    StorageApp.saveCart(Array.from(itemsSet));
  },

  renderCart() {
    const cart = StorageApp.getCart();
    const container = document.getElementById('cartCard');
    if (!container) return;

    container.innerHTML = cart.length === 0
      ? `<p class="muted" style="text-align:center;">No hay ingredientes calculados.</p>`
      : cart.map((item) => `
          <div class="cart-item">
            <input type="checkbox" style="transform: scale(1.1); accent-color: var(--primary);">
            <span style="flex:1;">${item}</span>
          </div>
        `).join('');
  },

  renderProfile() {
    const profile = StorageApp.getProfile();
    if (!profile) return;
    document.getElementById('profileNameDisplay').innerText = profile.name;
    document.getElementById('profileMetaDisplay').innerText = `Meta diaria asignada: ${profile.targetKcal} kcal, adaptada a tu cuerpo, actividad y objetivo.`;

    const prefsEl = document.getElementById('profilePrefsDisplay');
    if (!prefsEl) return;

    const countryLabels = {
      mexico: 'México', guatemala: 'Guatemala', honduras: 'Honduras', el_salvador: 'El Salvador',
      nicaragua: 'Nicaragua', costa_rica: 'Costa Rica', panama: 'Panamá', colombia: 'Colombia',
      venezuela: 'Venezuela', ecuador: 'Ecuador', peru: 'Perú', bolivia: 'Bolivia', chile: 'Chile',
      argentina: 'Argentina', uruguay: 'Uruguay', paraguay: 'Paraguay',
      republica_dominicana: 'República Dominicana', cuba: 'Cuba', otro: 'Otro'
    };
    const activityLabels = {
      sedentario: 'Sedentario', ligero: 'Ligero', moderado: 'Moderado',
      activo: 'Activo', muy_activo: 'Muy activo'
    };
    const goalLabels = {
      bajar_peso: 'Bajar de peso', mantener: 'Mantener mi peso', subir_peso: 'Subir de peso',
      ganar_musculo: 'Ganar músculo', comer_saludable: 'Comer más saludable'
    };
    const healthLabels = {
      colesterol_alto: 'Colesterol alto', hipertension: 'Hipertensión', diabetes: 'Diabetes'
    };
    const restrictionLabels = {
      vegetariano: 'Vegetariano', vegano: 'Vegano', sin_gluten: 'Sin gluten',
      sin_lactosa: 'Sin lactosa', sin_carbo: 'Bajo en carbohidratos'
    };
    const mealsPerDayLabels = { '3': '3 comidas grandes', '4': '4 comidas', '5_6': '5-6 comidas pequeñas' };
    const cookTimeLabels = { poco: 'Poco tiempo', moderado: 'Tiempo moderado', mucho: 'Le dedico tiempo' };
    const budgetLabels = { economico: 'Económico', medio: 'Medio', sin_restriccion: 'Sin restricciones' };
    const cuisineLabels = {
      italiana: 'Italiana', mexicana: 'Mexicana', asiatica: 'Asiática',
      mediterranea: 'Mediterránea', criolla: 'Argentina/Criolla'
    };
    const chatStyleLabels = {
      amigable: 'Amigable y cercano', motivador: 'Motivador y con energía',
      tecnico: 'Técnico y directo', humor: 'Con humor y onda'
    };

    const countryText = countryLabels[profile.country] || '—';
    const activityText = activityLabels[profile.activity] || '—';
    const goalText = goalLabels[profile.goals?.[0]] || '—';
    const healthText = (profile.healthConditions || []).map(h => healthLabels[h] || h).join(', ') || 'Ninguna';
    const allergiesText = (profile.allergies || []).join(', ') || 'Ninguna';
    const restrictionsText = (profile.restrictions || []).map(r => restrictionLabels[r] || r).join(', ') || 'Ninguna';
    const dislikesText = (profile.dislikes || []).join(', ') || 'Ninguno';
    const mealsPerDayText = mealsPerDayLabels[profile.mealsPerDay] || '—';
    const cookTimeText = cookTimeLabels[profile.cookTime] || '—';
    const budgetText = budgetLabels[profile.budget] || '—';
    const waterText = profile.waterGlasses ? `${profile.waterGlasses} vasos/día` : 'No informado';
    const sleepText = profile.sleepHours ? `${profile.sleepHours} hs/noche` : 'No informado';
    const cuisinesText = (profile.cuisines || []).map(c => cuisineLabels[c] || c).join(', ') || 'Sin preferencia';
    const favoriteFoodsText = (profile.favoriteFoods || []).join(', ') || 'No informado';
    const chatStyleText = chatStyleLabels[profile.chatStyle] || 'Amigable y cercano';
    const chatNoteText = profile.chatCustomNote ? ` — "${profile.chatCustomNote}"` : '';

    prefsEl.innerHTML = `
      <b>País:</b> ${countryText} · <b>Actividad:</b> ${activityText}<br>
      <b>Objetivo:</b> ${goalText}<br>
      <b>Condiciones de salud:</b> ${healthText}<br>
      <b>Alergias:</b> ${allergiesText}<br>
      <b>Restricciones:</b> ${restrictionsText}<br>
      <b>Evita:</b> ${dislikesText}<br>
      <b>Comidas por día:</b> ${mealsPerDayText} · <b>Tiempo para cocinar:</b> ${cookTimeText}<br>
      <b>Presupuesto:</b> ${budgetText}<br>
      <b>Agua:</b> ${waterText} · <b>Sueño:</b> ${sleepText}<br>
      <b>Cocinas favoritas:</b> ${cuisinesText}<br>
      <b>Comidas favoritas:</b> ${favoriteFoodsText}<br>
      <b>Estilo de chat:</b> ${chatStyleText}${chatNoteText}
    `;
  },

  sendChat() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();

    const scroll = document.getElementById('chatScroll');
    scroll.innerHTML += `<div style="text-align:right; margin-bottom:10px;"><span style="background:var(--primary-dim); color:var(--primary); padding:8px 12px; border-radius:12px; display:inline-block; font-size:14px;">${msg}</span></div>`;

    input.value = '';

    setTimeout(() => {
      const profile = StorageApp.getProfile();
      const response = ChatApp.getBotResponse(msg, profile);
      scroll.innerHTML += `<div style="text-align:left; margin-bottom:10px;"><span style="background:var(--bg); padding:8px 12px; border-radius:12px; display:inline-block; font-size:14px;">${response}</span></div>`;
      scroll.scrollTop = scroll.scrollHeight;
    }, 400);
  },

  resetAll() {
    StorageApp.clearAll();
    location.reload();
  }
};

window.addEventListener('DOMContentLoaded', () => { UI.init(); });
