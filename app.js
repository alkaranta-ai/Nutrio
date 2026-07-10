// ARMADO DE PERFIL — pantalla única, sin pasos.
const Onboarding = {
  selected: {
    activity: null,
    goal: null,
    health: [],
    restrictions: []
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

  _bindMultiSelect(groupId, stateKey) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const val = chip.dataset.val;

      if (val === 'ninguna') {
        group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selected[stateKey] = ['ninguna'];
        return;
      }

      chip.classList.toggle('active');
      const ningunaChip = group.querySelector('[data-val="ninguna"]');
      if (ningunaChip) ningunaChip.classList.remove('active');

      const list = this.selected[stateKey].filter(v => v !== 'ninguna');
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
    this._bindMultiSelect('healthChips', 'health');
    this._bindMultiSelect('restrictionChips', 'restrictions');
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
      allergies: allergiesRaw ? allergiesRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [],
      restrictions: this.selected.restrictions,
      dislikes: dislikesRaw ? dislikesRaw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : []
    };

    profile.targetKcal = this._calculateTargetKcal(profile);

    StorageApp.saveProfile(profile);
    this.autoGenerateCart();
    UI.init();
  },

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

    return targetKcal;
  },

  autoGenerateCart() {
    let itemsSet = new Set();
    RECIPES_DB.forEach(r => {
      if (r.category === 'antojo') return;
      r.ingredients.forEach(ing => itemsSet.add(ing));
    });
    StorageApp.saveCart(Array.from(itemsSet));
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
    this.goto('chat');
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

  // --- FILTRADO INTELIGENTE DE RECETAS ---
  _getFilteredRecipes(category, profile) {
    return RECIPES_DB.filter(recipe => {
      if (recipe.category !== category) return false;

      // 1. Filtrar por Restricciones Alimentarias (Vegano, Vegetariano, etc.)
      if (profile.restrictions && profile.restrictions.length > 0) {
        const matchesAll = profile.restrictions.every(rest => recipe.tags.includes(rest));
        if (!matchesAll) return false;
      }

      // 2. Filtrar por Alergias y Disgustos (Evita contaminación de ingredientes)
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

  _getRandomElement(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  },

  renderHome() {
    const profile = StorageApp.getProfile();
    if (!profile) return;
    document.getElementById('homeGreeting').innerText = `¡Hola, ${profile.name}!`;
    document.getElementById('kcalDisplayTarget').innerText = `Tu requerimiento diario: ${profile.targetKcal} kcal / Objetivo Activo.`;

    const container = document.getElementById('dayMealsContainer');
    if (!container) return;

    // Obtenemos recetas aptas filtradas para el usuario
    const breakfasts = this._getFilteredRecipes('desayuno', profile);
    const lunches = this._getFilteredRecipes('almuerzo', profile);
    const snacks = this._getFilteredRecipes('meriendas', profile);
    const dinners = this._getFilteredRecipes('cena', profile);

    // Selección aleatoria real para romper la monotonía
    const breakfast = this._getRandomElement(breakfasts) || RECIPES_DB[0];
    const lunch = this._getRandomElement(lunches) || RECIPES_DB[8];
    const snack = this._getRandomElement(snacks) || RECIPES_DB[16];
    const dinner = this._getRandomElement(dinners) || RECIPES_DB[22];

    container.innerHTML = `
      <div class="card">
        <div class="meal-slot" style="margin-bottom: 12px;"><div class="meal-title">🍳 Desayuno</div><h3>${breakfast.name}</h3><p style="font-size:13px; color:var(--text-muted);">${breakfast.kcal} kcal • ${breakfast.ingredients.join(', ')}</p></div>
        <div class="meal-slot" style="margin-bottom: 12px;"><div class="meal-title">🍗 Almuerzo</div><h3>${lunch.name}</h3><p style="font-size:13px; color:var(--text-muted);">${lunch.kcal} kcal • ${lunch.ingredients.join(', ')}</p></div>
        <div class="meal-slot" style="margin-bottom: 12px;"><div class="meal-title">🥪 Merienda</div><h3>${snack.name}</h3><p style="font-size:13px; color:var(--text-muted);">${snack.kcal} kcal • ${snack.ingredients.join(', ')}</p></div>
        <div class="meal-slot"><div class="meal-title">🍽️ Cena</div><h3>${dinner.name}</h3><p style="font-size:13px; color:var(--text-muted);">${dinner.kcal} kcal • ${dinner.ingredients.join(', ')}</p></div>
      </div>
    `;
  },

  renderWeeklyPlan() {
    const profile = StorageApp.getProfile();
    if (!profile) return;

    const container = document.getElementById('weeklyPlanContainer');
    if (!container) return;

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    const lunches = this._getFilteredRecipes('almuerzo', profile);
    const dinners = this._getFilteredRecipes('cena', profile);

    container.innerHTML = days.map((day) => {
      // Elige platos aleatorios diferentes para cada día de la semana
      const mainPlate = this._getRandomElement(lunches) || RECIPES_DB[8];
      const dinnerPlate = this._getRandomElement(dinners) || RECIPES_DB[22];
      
      return `
        <div class="card" style="margin-bottom:12px;">
          <h3 style="color:var(--primary); margin-bottom:6px;">${day}</h3>
          <p style="font-size:14px; color:var(--text);"><b>Almuerzo:</b> ${mainPlate.name} (${mainPlate.kcal} kcal)</p>
          <p style="font-size:14px; color:var(--text); margin-top:2px;"><b>Cena:</b> ${dinnerPlate.name} (${dinnerPlate.kcal} kcal)</p>
        </div>
      `;
    }).join('');
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

    const countryText = countryLabels[profile.country] || '—';
    const activityText = activityLabels[profile.activity] || '—';
    const goalText = goalLabels[profile.goals?.[0]] || '—';
    const healthText = (profile.healthConditions || []).map(h => healthLabels[h] || h).join(', ') || 'Ninguna';
    const allergiesText = (profile.allergies || []).join(', ') || 'Ninguna';
    const restrictionsText = (profile.restrictions || []).map(r => restrictionLabels[r] || r).join(', ') || 'Ninguna';
    const dislikesText = (profile.dislikes || []).join(', ') || 'Ninguno';

    prefsEl.innerHTML = `
      <b>País:</b> ${countryText} · <b>Actividad:</b> ${activityText}<br>
      <b>Objetivo:</b> ${goalText}<br>
      <b>Condiciones de salud:</b> ${healthText}<br>
      <b>Alergias:</b> ${allergiesText}<br>
      <b>Restricciones:</b> ${restrictionsText}<br>
      <b>Evita:</b> ${dislikesText}
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
