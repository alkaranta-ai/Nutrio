// ==========================================================================
// NUTRIO - ARCHIVO PRINCIPAL DE APLICACIÓN (js/app.js)
// ==========================================================================

const Onboarding = {
  // Selecciones de chips en memoria
  selected: {
    activity: null,
    goal: null,
    health: [],
    restrictions: [],
    mealsPerDay: null,
    cookTime: null,
    budget: null,
    cuisine: null,
    chatStyle: null
  },

  // Un chip por grupo (actividad, objetivo): al tocarlo se desactivan los demás.
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

  // Varios chips por grupo (salud, restricciones): se pueden marcar varios a la vez.
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
    this._bindSingleSelect('mealsPerDayChips', 'mealsPerDay');
    this._bindSingleSelect('cookTimeChips', 'cookTime');
    this._bindSingleSelect('budgetChips', 'budget');
    this._bindSingleSelect('cuisineChips', 'cuisine');
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
      if (errorBox) {
        errorBox.classList.add('show');
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        alert("Por favor, completa todos los campos obligatorios y selecciona tu actividad y objetivo.");
      }
      return;
    }
    if (errorBox) errorBox.classList.remove('show');

    const allergiesRaw = document.getElementById('fAllergies').value.trim();
    const dislikesRaw = document.getElementById('fDislikes').value.trim();
    const favoriteFoodsRaw = document.getElementById('fFavoriteFoods').value.trim();
    const waterGlasses = document.getElementById('fWaterGlasses').value;
    const sleepHours = document.getElementById('fSleepHours').value;
    const chatCustom = document.getElementById('fChatCustom').value.trim();

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
      mealsPerDay: this.selected.mealsPerDay,
      cookTime: this.selected.cookTime,
      budget: this.selected.budget,
      cuisine: this.selected.cuisine,
      favoriteFoods: favoriteFoodsRaw ? favoriteFoodsRaw.split(',').map(s => s.trim()).filter(Boolean) : [],
      waterGlasses: waterGlasses ? parseInt(waterGlasses, 10) : null,
      sleepHours: sleepHours ? parseFloat(sleepHours) : null,
      chatStyle: this.selected.chatStyle,
      chatCustom: chatCustom || null
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
    if (typeof RECIPES_DB !== 'undefined') {
      RECIPES_DB.forEach(r => {
        if (r.category === 'antojo') return;
        r.ingredients.forEach(ing => itemsSet.add(ing));
      });
    }
    StorageApp.saveCart(Array.from(itemsSet));
  }
};

// ==========================================================================
// Metadata visual de cada momento de comida: ícono y color de acento.
// Los colores usan las variables CSS definidas en :root (ver index.html).
// ==========================================================================
const MEAL_META = {
  desayuno: { label: 'Desayuno', icon: '☀️', color: 'var(--accent-desayuno)', dim: 'var(--accent-desayuno-dim)' },
  almuerzo: { label: 'Almuerzo', icon: '🥗', color: 'var(--accent-almuerzo)', dim: 'var(--accent-almuerzo-dim)' },
  merienda: { label: 'Merienda', icon: '🧉', color: 'var(--accent-merienda)', dim: 'var(--accent-merienda-dim)' },
  cena: { label: 'Cena', icon: '🌙', color: 'var(--accent-cena)', dim: 'var(--accent-cena-dim)' },
  antojo: { label: 'Piqueteo', icon: '🍿', color: 'var(--accent-antojo)', dim: 'var(--accent-antojo-dim)' }
};

// Mapea las claves "de UI" (singular, usadas en MEAL_META / chat) a las
// claves reales de categoría que usan RECIPES_DB, BEBIDAS_DB y MealEngine
// ("meriendas" en plural). Única fuente de verdad para esta traducción,
// así evitamos strings sueltos repetidos por todo el archivo.
const SLOT_TO_CATEGORY = {
  desayuno: 'desayuno',
  almuerzo: 'almuerzo',
  merienda: 'meriendas',
  cena: 'cena',
  antojo: 'meriendas' // de madrugada, si no hay nada mejor, caemos a merienda
};

const UI = {

  // Guarda referencias de recetas (y su bebida sugerida) para poder abrir
  // el modal sin serializar objetos completos dentro de atributos HTML.
  _recipeRefs: {},

  init() {
    // IMPORTANTE: Primero le damos vida a las escuchas de los chips pase lo que pase
    Onboarding.bindAllChips();
    this._bindTapFeedback();
    this._bindChatInputAutoGrow();

    const firstTimeEl = document.getElementById('chatFirstMsgTime');
    if (firstTimeEl) firstTimeEl.innerText = this._formatTime(new Date());

    const profile = StorageApp.getProfile();
    if (!profile) {
      document.getElementById('onboarding').style.display = 'block';
      document.getElementById('app').style.display = 'none';
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

  // Da la sensación de "toque" en tarjetas y pestañas: agrega/quita
  // la clase .pressed sin depender de :active (poco confiable en iOS/Safari).
  _bindTapFeedback() {
    const press = (e) => {
      const el = e.target.closest('.tap-feedback');
      if (el) el.classList.add('pressed');
    };
    const release = () => {
      document.querySelectorAll('.tap-feedback.pressed').forEach(el => el.classList.remove('pressed'));
    };
    document.addEventListener('pointerdown', press);
    document.addEventListener('pointerup', release);
    document.addEventListener('pointercancel', release);
    document.addEventListener('pointerleave', release, true);
  },

  // El textarea del chat crece hasta 120px a medida que se escribe más.
  _bindChatInputAutoGrow() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
  },

  _formatTime(date) {
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
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

    const inputBar = document.getElementById('chatInputBar');
    if (inputBar) inputBar.style.display = viewName === 'chat' ? 'block' : 'none';
  },

  // --------------------------------------------------------------------
  // Tarjetas de comida (usadas tanto en Inicio como en Semana)
  // --------------------------------------------------------------------
  _registerRecipeRef(refId, recipe, typeKey, drink) {
    this._recipeRefs[refId] = { recipe, typeKey, drink };
  },

  _buildDrinkPreviewHTML(drink) {
    if (!drink) return '';
    const altHTML = drink.conAlcohol
      ? ` <span class="meal-card-drink-alt">· 🍷 ${drink.conAlcohol}</span>`
      : '';
    return `<div class="meal-card-drink">🥤 ${drink.sinAlcohol}${altHTML}</div>`;
  },

  _buildMealCardHTML(refId, typeKey, recipe, drink) {
    if (!recipe) return '';
    this._registerRecipeRef(refId, recipe, typeKey, drink);
    const meta = MEAL_META[typeKey] || MEAL_META.antojo;
    const ingredientsPreview = (recipe.ingredients || []).join(', ');
    const drinkPreview = this._buildDrinkPreviewHTML(drink);

    return `
      <div class="meal-card tap-feedback" style="--accent:${meta.color}; --accent-dim:${meta.dim};" onclick="UI.openRecipeModalByRef('${refId}')">
        <div class="meal-icon">${meta.icon}</div>
        <div class="meal-card-body">
          <div class="meal-card-top">
            <span class="meal-card-label">${meta.label}</span>
            <span class="meal-card-kcal">${recipe.kcal || '—'} kcal</span>
          </div>
          <div class="meal-card-name">${recipe.name || ''}</div>
          <div class="meal-card-ingredients">${ingredientsPreview}</div>
          ${drinkPreview}
          <div class="meal-card-hint">Ver receta y preparación →</div>
        </div>
      </div>
    `;
  },

  renderHome() {
    const profile = StorageApp.getProfile();
    if (!profile || typeof RECIPES_DB === 'undefined' || typeof MealEngine === 'undefined') return;
    document.getElementById('homeGreeting').innerText = `¡Hola, ${profile.name}!`;
    document.getElementById('kcalDisplayNum').innerText = profile.targetKcal;
    document.getElementById('kcalDisplayTarget').innerText = `Calculado según tu cuerpo, actividad y objetivo activo.`;

    const container = document.getElementById('dayMealsContainer');
    if (!container) return;

    // Usamos el MealEngine real (filtra por restricciones/alergias/salud,
    // ajusta por kcal y rota sin repetir) en vez de índices fijos.
    const today = new Date();
    const slots = [
      { typeKey: 'desayuno', refId: 'home-desayuno' },
      { typeKey: 'almuerzo', refId: 'home-almuerzo' },
      { typeKey: 'merienda', refId: 'home-merienda' },
      { typeKey: 'cena', refId: 'home-cena' }
    ];

    container.innerHTML = slots.map(({ typeKey, refId }) => {
      const category = SLOT_TO_CATEGORY[typeKey];
      const recipe = MealEngine.getMealForDate(category, profile, today);
      const drink = MealEngine.getDrinkSuggestion(category, profile, today);
      return this._buildMealCardHTML(refId, typeKey, recipe, drink);
    }).join('');
  },

  renderWeeklyPlan() {
    const tabsContainer = document.getElementById('weekDayTabs');
    const profile = StorageApp.getProfile();
    if (!tabsContainer || typeof RECIPES_DB === 'undefined' || typeof MealEngine === 'undefined' || !profile) return;

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    this._weekDays = days;

    // Lunes=0 ... Domingo=6, calculado a partir del día real de la semana.
    const jsDay = new Date().getDay(); // 0=domingo
    const todayIdx = (jsDay + 6) % 7;
    this._weekTodayIdx = todayIdx;

    // Arrancamos el plan el lunes de esta semana, así el domingo (día
    // permitido, con opción de bebida con alcohol) siempre cae en su lugar.
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - todayIdx);

    const plan = MealEngine.getPlanForDays(profile, monday, 7);

    this._weekData = days.map((day, idx) => {
      const dayPlan = plan[idx];
      return {
        day,
        isCheatDay: dayPlan.isCheatDay,
        breakfast: dayPlan.meals.desayuno.recipe,
        breakfastDrink: dayPlan.meals.desayuno.drink,
        lunch: dayPlan.meals.almuerzo.recipe,
        lunchDrink: dayPlan.meals.almuerzo.drink,
        snack: dayPlan.meals.meriendas.recipe,
        snackDrink: dayPlan.meals.meriendas.drink,
        dinner: dayPlan.meals.cena.recipe,
        dinnerDrink: dayPlan.meals.cena.drink
      };
    });

    tabsContainer.innerHTML = days.map((day, idx) => `
      <div class="day-tab tap-feedback ${idx === todayIdx ? 'is-today' : ''}" data-idx="${idx}" onclick="UI.renderWeekDay(${idx})">
        <span class="d-label">${day.slice(0, 3)}</span>
        <span class="d-dot"></span>
      </div>
    `).join('');

    this.renderWeekDay(todayIdx);
  },

  renderWeekDay(idx) {
    if (!this._weekData || !this._weekData[idx]) return;
    const data = this._weekData[idx];

    document.querySelectorAll('#weekDayTabs .day-tab').forEach(tab => {
      tab.classList.toggle('active', parseInt(tab.dataset.idx, 10) === idx);
    });

    const heading = document.getElementById('weekDayHeading');
    if (heading) {
      const suffix = idx === this._weekTodayIdx ? ' · hoy' : '';
      const cheatSuffix = data.isCheatDay ? ' · 🍷 día permitido' : '';
      heading.innerHTML = `<b>${data.day}</b>${suffix}${cheatSuffix}`;
    }

    const container = document.getElementById('weeklyPlanContainer');
    if (!container) return;
    container.innerHTML =
      this._buildMealCardHTML(`week-${idx}-desayuno`, 'desayuno', data.breakfast, data.breakfastDrink) +
      this._buildMealCardHTML(`week-${idx}-almuerzo`, 'almuerzo', data.lunch, data.lunchDrink) +
      this._buildMealCardHTML(`week-${idx}-merienda`, 'merienda', data.snack, data.snackDrink) +
      this._buildMealCardHTML(`week-${idx}-cena`, 'cena', data.dinner, data.dinnerDrink);
  },

  // --------------------------------------------------------------------
  // Modal de receta: ingredientes + preparación + bebida sugerida
  // --------------------------------------------------------------------
  openRecipeModalByRef(refId) {
    const ref = this._recipeRefs[refId];
    if (!ref) return;
    this.openRecipeModal(ref.recipe, ref.typeKey, ref.drink);
  },

  openRecipeModal(recipe, typeKey, drink) {
    if (!recipe) return;
    const meta = MEAL_META[typeKey] || MEAL_META.antojo;
    const content = document.getElementById('recipeModalContent');
    const modal = document.getElementById('recipeModal');
    if (!content || !modal) return;

    const ingredientsHTML = (recipe.ingredients || [])
      .map(ing => `<span class="ingredient-chip">${ing}</span>`).join('');

    const steps = recipe.instructions || recipe.steps || recipe.preparation || null;
    let instructionsHTML;
    if (Array.isArray(steps) && steps.length) {
      instructionsHTML = `<ol class="instructions-list">${steps.map(s => `<li>${s}</li>`).join('')}</ol>`;
    } else if (typeof steps === 'string' && steps.trim()) {
      instructionsHTML = `<p style="font-size:14px; color:var(--text); line-height:1.5;">${steps}</p>`;
    } else {
      instructionsHTML = `<div class="instructions-empty">Todavía no cargaste los pasos de preparación para esta receta. Agregá un campo <code>instructions</code> (array de pasos) a la receta en <b>data.js</b> para que aparezcan acá.</div>`;
    }

    let drinkHTML = '';
    if (drink) {
      const alcoholHTML = drink.conAlcohol
        ? `<span class="ingredient-chip drink-alcohol-chip">🍷 ${drink.conAlcohol} <small>(día permitido)</small></span>`
        : '';
      drinkHTML = `
        <div class="modal-section-title">Bebida sugerida</div>
        <div class="ingredient-chip-list">
          <span class="ingredient-chip">🥤 ${drink.sinAlcohol}</span>
          ${alcoholHTML}
        </div>
      `;
    }

    content.innerHTML = `
      <div class="recipe-modal-header">
        <span class="recipe-badge" style="background:${meta.dim}; color:${meta.color};">${meta.icon} ${meta.label}</span>
        <button class="modal-close" onclick="UI.closeRecipeModal()">✕</button>
      </div>
      <div class="modal-recipe-name">${recipe.name || ''}</div>
      <span class="modal-kcal-pill">${recipe.kcal || '—'} kcal</span>

      <div class="modal-section-title">Ingredientes</div>
      <div class="ingredient-chip-list">${ingredientsHTML}</div>

      <div class="modal-section-title">Preparación</div>
      ${instructionsHTML}

      ${drinkHTML}
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeRecipeModal() {
    const modal = document.getElementById('recipeModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  closeRecipeModalOnOverlay(event) {
    if (event.target && event.target.id === 'recipeModal') {
      this.closeRecipeModal();
    }
  },

  // --------------------------------------------------------------------
  renderCart() {
    const cart = StorageApp.getCart();
    const container = document.getElementById('cartCard');
    if (!container) return;

    const hoyKey = new Date().toLocaleDateString('es-AR');
    let tildadosHoy = JSON.parse(localStorage.getItem(`nutrio_checked_${hoyKey}`)) || [];

    if (cart.length === 0) {
      container.innerHTML = `<p class="muted" style="text-align:center;">No hay ingredientes calculados.</p>`;
      return;
    }

    let html = '<div>';
    cart.forEach((item) => {
      const isChecked = tildadosHoy.includes(item);
      html += `
        <div class="cart-item" style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <input type="checkbox" data-item="${item}" ${isChecked ? 'checked' : ''}
                 style="transform: scale(1.1); accent-color: var(--primary); cursor:pointer;"
                 onclick="UI.handleCheck(this, '${item}')">
          <span style="flex:1; ${isChecked ? 'text-decoration:line-through; opacity:0.5;' : ''}">${item}</span>
        </div>
      `;
    });

    html += `
      <button onclick="UI.archivePurchases()" style="width:100%; margin-top:15px; background:var(--primary); color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;">
        🛒 Guardar Compra del Día (${hoyKey})
      </button>
    </div>`;

    let historial = JSON.parse(localStorage.getItem('nutrio_history')) || [];
    html += `<div style="margin-top:25px; border-top:1px dashed #ccc; padding-top:15px;">
              <h4 style="margin-bottom:10px; color:var(--text);">🗃️ Carrito e Historial de Compras</h4>`;

    if (historial.length === 0) {
      html += `<p style="font-size:12px; color:gray;">Aún no guardaste compras. Lo que tildes arriba quedará registrado acá por día.</p>`;
    } else {
      historial.forEach(h => {
        html += `<div style="background:rgba(0,0,0,0.02); padding:8px; border-radius:6px; margin-bottom:6px; font-size:13px;">
                  <b>📅 Día ${h.date}:</b> ${h.items.join(', ')}
                 </div>`;
      });
    }
    html += '</div>';
    container.innerHTML = html;
  },

  handleCheck(cb, item) {
    const hoyKey = new Date().toLocaleDateString('es-AR');
    let tildadosHoy = JSON.parse(localStorage.getItem(`nutrio_checked_${hoyKey}`)) || [];

    if (cb.checked) {
      if (!tildadosHoy.includes(item)) tildadosHoy.push(item);
      cb.nextElementSibling.style.textDecoration = 'line-through';
      cb.nextElementSibling.style.opacity = '0.5';
    } else {
      tildadosHoy = tildadosHoy.filter(i => i !== item);
      cb.nextElementSibling.style.textDecoration = 'none';
      cb.nextElementSibling.style.opacity = '1';
    }
    localStorage.setItem(`nutrio_checked_${hoyKey}`, JSON.stringify(tildadosHoy));
  },

  archivePurchases() {
    const hoyKey = new Date().toLocaleDateString('es-AR');
    let tildadosHoy = JSON.parse(localStorage.getItem(`nutrio_checked_${hoyKey}`)) || [];

    if (tildadosHoy.length === 0) {
      alert("¡Che! Primero tildá en la lista los artículos que ya compraste.");
      return;
    }

    let historial = JSON.parse(localStorage.getItem('nutrio_history')) || [];
    historial.unshift({ date: hoyKey, items: [...tildadosHoy] });
    localStorage.setItem('nutrio_history', JSON.stringify(historial));

    localStorage.removeItem(`nutrio_checked_${hoyKey}`);
    alert("¡Espectacular! Guardado en tu historial. Los artículos se destildaron para que la lista te quede limpia.");
    this.renderCart();
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
    const chatStyleText = chatStyleLabels[profile.chatStyle] || 'Amigable con humor 🎭';

    prefsEl.innerHTML = `
      <b>País:</b> ${countryText} · <b>Actividad:</b> ${activityText}<br>
      <b>Objetivo:</b> ${goalText}<br>
      <b>Condiciones de salud:</b> ${healthText}<br>
      <b>Alergias:</b> ${allergiesText}<br>
      <b>Restricciones:</b> ${restrictionsText}<br>
      <b>Evita:</b> ${dislikesText}<br>
      <b>Estilo de Chat:</b> ${chatStyleText}
    `;
  },

  sendChat() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();
    const now = new Date();

    const scroll = document.getElementById('chatScroll');
    if (scroll) {
      scroll.innerHTML += `
        <div class="msg-row user">
          <div class="msg-wrap">
            <div class="msg-bubble user">${msg}</div>
            <div class="msg-time">${this._formatTime(now)}</div>
          </div>
        </div>`;
      scroll.scrollTop = scroll.scrollHeight;
    }

    input.value = '';
    input.style.height = 'auto';

    setTimeout(() => {
      const profile = StorageApp.getProfile();
      const response = ChatApp.getBotResponse(msg, profile);
      const msgId = 'chatmsg_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      const botTime = new Date();

      if (scroll) {
        scroll.innerHTML += `
          <div class="msg-row bot" id="${msgId}">
            <div class="msg-wrap">
              <div class="msg-bubble bot">${response.text}</div>
              <div class="msg-time">${this._formatTime(botTime)}</div>
              <div class="chat-feedback">
                <button type="button" data-role="like" title="Me gusta" onclick="UI.rateResponse('${msgId}', '${response.category}', ${response.idx}, true)">👍</button>
                <button type="button" data-role="dislike" title="No me gusta" onclick="UI.rateResponse('${msgId}', '${response.category}', ${response.idx}, false)">👎</button>
              </div>
            </div>
          </div>`;
        scroll.scrollTop = scroll.scrollHeight;
      }
    }, 400);
  },

  // Guarda si al usuario le gustó o no una respuesta puntual del bot.
  // Esto hace que ChatApp deje de repetir las variantes marcadas con 👎
  // (y priorice, dentro de lo posible, las que tuvieron 👍).
  rateResponse(msgId, category, idx, liked) {
    ChatApp.recordFeedback(category, idx, liked);

    const container = document.getElementById(msgId);
    if (!container) return;
    const likeBtn = container.querySelector('[data-role="like"]');
    const dislikeBtn = container.querySelector('[data-role="dislike"]');
    if (likeBtn) likeBtn.classList.toggle('active', liked);
    if (dislikeBtn) dislikeBtn.classList.toggle('active', !liked);
  },

  resetAll() {
    StorageApp.clearAll();
    location.reload();
  }
};

// ==========================================================================
// MÓDULO DE CHAT (única declaración global, sin duplicados)
// ==========================================================================
window.ChatApp = {

  // Guarda el último índice mostrado por categoría, para no repetir dos veces seguidas.
  _lastVariantByCategory: {},

  // Saca tildes y pasa a minúsculas para que el matching de palabras clave
  // sea más flexible ("qué puedo comer" == "que puedo comer").
  // También traduce lunfardo/modismos rioplatenses (morfar, manyar, tragar, etc.)
  // a su forma estándar ("comer") ANTES de evaluar las reglas de abajo.
  _normalize(str) {
    let s = str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const lunfardo = [
      [/\bmorfar\b|\bmorfando\b|\bmorfe\b|\bmorfo\b/g, 'comer'],
      [/\bmanyar\b|\bmanyando\b|\bmanye\b|\bmanyo\b/g, 'comer'],
      [/\btragar\b|\btragando\b/g, 'comer'],
      [/\bchapar algo\b/g, 'comer algo'],
      [/\bque manyo\b/g, 'que como']
    ];
    lunfardo.forEach(([regex, replacement]) => {
      s = s.replace(regex, replacement);
    });

    return s;
  },

  // Determina en qué franja horaria estamos, en base a la hora real del dispositivo.
  _getMealSlot() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return { key: 'desayuno', label: 'Desayuno' };
    if (hour >= 11 && hour < 15) return { key: 'almuerzo', label: 'Almuerzo' };
    if (hour >= 15 && hour < 19) return { key: 'merienda', label: 'Merienda' };
    if (hour >= 19 && hour < 23) return { key: 'cena', label: 'Cena' };
    return { key: 'antojo', label: 'Piqueteo / algo ligero' }; // madrugada
  },

  // Usa exactamente el mismo MealEngine que UI.renderHome()/renderWeekDay(),
  // así el chat y las solapas de Inicio/Semana jamás se contradicen entre sí.
  _getRecipeForSlot(slotKey, profile) {
    if (typeof MealEngine === 'undefined') return null;
    const category = SLOT_TO_CATEGORY[slotKey] || 'meriendas';
    return MealEngine.getMealForDate(category, profile, new Date());
  },

  // Misma lógica pero para la bebida sugerida de esa franja horaria.
  _getDrinkForSlot(slotKey, profile) {
    if (typeof MealEngine === 'undefined') return null;
    const category = SLOT_TO_CATEGORY[slotKey] || 'meriendas';
    return MealEngine.getDrinkSuggestion(category, profile, new Date());
  },

  // --------------------------------------------------------------------
  // Sistema de feedback (👍/👎) por categoría de respuesta.
  // Estructura en localStorage:
  // { [categoria]: { liked: [idx,...], disliked: [idx,...] } }
  // --------------------------------------------------------------------
  _getFeedbackStore() {
    return JSON.parse(localStorage.getItem('nutrio_chat_feedback')) || {};
  },

  recordFeedback(category, idx, liked) {
    const feedback = this._getFeedbackStore();
    if (!feedback[category]) feedback[category] = { liked: [], disliked: [] };
    feedback[category].liked = feedback[category].liked.filter(i => i !== idx);
    feedback[category].disliked = feedback[category].disliked.filter(i => i !== idx);
    if (liked) feedback[category].liked.push(idx);
    else feedback[category].disliked.push(idx);
    localStorage.setItem('nutrio_chat_feedback', JSON.stringify(feedback));
  },

  // Elige una variante para "category" dentro de "variants" (array de strings
  // o de funciones que reciben los args extra), evitando las marcadas con 👎
  // y evitando repetir la misma dos veces seguidas cuando hay opciones.
  pickVariant(category, variants, ...args) {
    const feedback = this._getFeedbackStore();
    const catFeedback = feedback[category] || { liked: [], disliked: [] };

    let available = variants.map((_, i) => i).filter(i => !catFeedback.disliked.includes(i));
    if (available.length === 0) available = variants.map((_, i) => i); // si están todas con 👎, reseteamos

    const last = this._lastVariantByCategory[category];
    if (available.length > 1 && last !== undefined) {
      const withoutLast = available.filter(i => i !== last);
      if (withoutLast.length > 0) available = withoutLast;
    }

    const idx = available[Math.floor(Math.random() * available.length)];
    this._lastVariantByCategory[category] = idx;

    const raw = variants[idx];
    const text = typeof raw === 'function' ? raw(...args) : raw;

    return { text, category, idx };
  },

  getBotResponse(userMessage, profile) {
    const msg = this._normalize(userMessage);
    const name = profile && profile.name ? ` ${profile.name}` : ' che';

    // --- Caso especial: pregunta por el mate (antes de todo lo demás) ---
    const hablaDeMate = /\bmate\b/.test(msg) && !msg.includes('matematica');
    if (hablaDeMate && !msg.includes('no me gusta')) {
      const now = new Date();
      const horaTxt = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      return this.pickVariant('mate', [
        (h) => `Son las ${h}, así que el mate pide algo dulce o tostado: bizcochitos, tostadas con manteca y mermelada, factura si estás con onda, o algo salado tipo tostadas con queso si preferís no llenarte de azúcar. Si querés algo más completo, mirá la solapa de **Inicio**, ahí tenés armado el resto del día. 🧉`,
        (h) => `A las ${h} el mate pega bien con algo simple: tostadas, un pancito con queso, o una fruta si querés ir más liviano. En la solapa de **Inicio** tenés el resto del día armado. 🧉`,
        (h) => `Mate a las ${h}... buena elección. Acompañalo con algo tostado o una fruta, y si querés algo más armado fijate en **Inicio** o **Semana**. 🧉`
      ], horaTxt);
    }

    // --- Despedidas: chau, nos vemos, hasta luego, me voy, etc. ---
    const esDespedida =
      /\bchau\b/.test(msg) ||
      /\bnos vemos\b/.test(msg) ||
      /\bhasta luego\b/.test(msg) ||
      /\bhasta manana\b/.test(msg) ||
      /\bhasta la proxima\b/.test(msg) ||
      /\bme voy\b/.test(msg) ||
      /\bme tengo que ir\b/.test(msg) ||
      /\badios\b/.test(msg) ||
      /\bbye\b/.test(msg);

    if (esDespedida) {
      return this.pickVariant('despedida', [
        (n) => `¡Chau${n}! Que la vayas bien, nos vemos en la próxima. Recordá tomar agua y no saltearte las comidas. 👋`,
        (n) => `¡Nos vemos${n}! Cualquier cosa acá ando. Que tengas un lindo resto del día. 🌱`,
        (n) => `¡Listo${n}, hasta la próxima! Si te tienta algo raro de comer, ya sabés dónde encontrarme. 😉`,
        (n) => `¡Dale${n}, cuidate! Nos vemos prontito por acá. 🍎`,
        (n) => `¡Chau chau${n}! Fue un gusto charlar, ¡a comer rico! 🥗`
      ], name);
    }

    // --- "¿Qué puedo tomar?" / preguntas sobre bebidas (fuera del caso especial del mate) ---
    const preguntaQueTomar =
      (msg.includes('que tomo') ||
       msg.includes('que puedo tomar') ||
       msg.includes('que bebo') ||
       msg.includes('que puedo beber') ||
       msg.includes('que hay para tomar') ||
       msg.includes('que hay para beber') ||
       msg.includes('para tomar') ||
       msg.includes('tengo sed') ||
       msg.includes('bebida') ||
       msg.includes('bebidas') ||
       /\bvino\b/.test(msg) ||
       /\bcerveza\b/.test(msg) ||
       /\btrago\b/.test(msg) ||
       /\bbeber\b/.test(msg) ||
       /\btomar algo\b/.test(msg)) &&
      !msg.includes('no me gusta');

    if (preguntaQueTomar) {
      const slot = this._getMealSlot();
      const drink = this._getDrinkForSlot(slot.key, profile);
      const now = new Date();
      const horaTxt = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

      if (!drink) {
        return this.pickVariant('que_tomar_sin_bebida', [
          (h, l) => `Son las ${h}, momento de **${l}**. Todavía no tengo bebidas cargadas, pero fijate en Inicio o en la Semana para ver qué te armé.`
        ], horaTxt, slot.label);
      }

      return this.pickVariant('que_tomar', [
        (h, l, d) => `Son las ${h}, así que para **${l}** te tiro ${d.sinAlcohol}${d.conAlcohol ? `. Y como hoy es día permitido, también te podés dar el gusto con ${d.conAlcohol} 🍷` : '.'} 🥤`,
        (h, l, d) => `Para acompañar tu **${l}** (son las ${h}), va bien ${d.sinAlcohol}${d.conAlcohol ? `, o si querés algo con onda, ${d.conAlcohol} porque hoy es día permitido 🍷` : ''}. 🥤`,
        (h, l, d) => `A las ${h}, en **${l}**, te sugiero ${d.sinAlcohol}${d.conAlcohol ? `. Ya que es domingo (día permitido), también entra ${d.conAlcohol} 🍷` : '.'} 🥤`
      ], horaTxt, slot.label, drink);
    }

    // --- "¿Qué puedo comer ahora?" tiene prioridad sobre el resto ---
    // (incluye variantes en lunfardo, ya normalizadas arriba a "comer")
    const preguntaQueComer =
      (msg.includes('que puedo comer') ||
       msg.includes('que como') ||
       msg.includes('que comer') ||
       msg.includes('tengo hambre') ||
       msg.includes('hambre canina') ||
       msg.includes('hambre feroz') ||
       msg.includes('me muero de hambre') ||
       msg.includes('se me antoja') ||
       msg.includes('que hay para comer') ||
       msg.includes('algo para comer') ||
       msg.includes('quiero comer')) &&
      !msg.includes('no me gusta');

    if (preguntaQueComer) {
      const slot = this._getMealSlot();
      const recipe = this._getRecipeForSlot(slot.key, profile);
      const drink = this._getDrinkForSlot(slot.key, profile);
      const now = new Date();
      const horaTxt = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

      if (!recipe) {
        return this.pickVariant('que_comer_sin_receta', [
          (h, l) => `Son las ${h}, momento de **${l}**. Todavía no tengo tus recetas cargadas, pero fijate en Inicio o en la Semana para ver qué te armé.`
        ], horaTxt, slot.label);
      }

      const ingredientesTxt = recipe.ingredients ? recipe.ingredients.join(', ') : '';
      let restriccionesNote = '';
      if (profile && profile.restrictions && profile.restrictions.length) {
        restriccionesNote = ` (ya tuve en cuenta que sos ${profile.restrictions.join(', ')})`;
      }

      // Armamos la frase de bebida acá para no repetir la lógica en las 3 variantes.
      let drinkTxt = '';
      if (drink) {
        drinkTxt = ` Para acompañar, va bien con ${drink.sinAlcohol}`;
        drinkTxt += drink.conAlcohol
          ? `, o si querés date el gusto con ${drink.conAlcohol} (hoy es día permitido 🍷).`
          : '.';
      }

      return this.pickVariant('que_comer', [
        (h, l, r, ing, note, d) => `Son las ${h}, así que te toca **${l}**${note}: **${r.name}** (${r.kcal} kcal) con ${ing}.${d} Está armado también en la solapa de Inicio si querés verlo con detalle. 🍽️`,
        (h, l, r, ing, note, d) => `Mirá la hora, son las ${h}: momento de **${l}**${note}. Te tiro esta: **${r.name}** (${r.kcal} kcal) con ${ing}.${d} Lo tenés también en Inicio. 😋`,
        (h, l, r, ing, note, d) => `A las ${h} te toca directamente **${l}**${note}. Va **${r.name}** (${r.kcal} kcal), con ${ing}.${d} Chequealo en Inicio si querés más detalle. 🍽️`
      ], horaTxt, slot.label, recipe, ingredientesTxt, restriccionesNote, drinkTxt);
    }

    // --- Saludos ---
    if (msg.includes('hola') || msg.includes('buen') || msg.includes('que onda') || msg.includes('como andas') || msg.includes('todo bien')) {
      return this.pickVariant('saludo', [
        (n) => `¡Qué hacés${n}! Todo tranqui por acá. ¿Qué andás cocinando o qué duda tenés hoy? Mirá que no muerdo... a menos que traigas facturas de dulce de leche. 🥞`,
        (n) => `¡Hola${n}! ¿Cómo va todo? Contame qué se te antoja o qué necesitás y vemos qué inventamos. 🍳`,
        (n) => `¡Buenas${n}! Acá andamos, listos para pensar en comida rica y sana. ¿En qué te ayudo?`,
        (n) => `¡Ey${n}! Justo estaba pensando en recetas. ¿Charlamos de comida o tenés otra duda?`,
        (n) => `¡Qué tal${n}! Todo en orden por NutrIO. Decime qué necesitás y vamos viendo. 😊`
      ], name);
    }

    // --- Dieta / calorías ---
    if (msg.includes('dieta') || msg.includes('calorias') || msg.includes('kcal')) {
      if (profile && profile.targetKcal) {
        return this.pickVariant('dieta', [
          (p) => `A ver, según los cálculos científicos (y mágicos) que metimos en tu Perfil, te corresponden **${p.targetKcal} kcal** al día. No te persigas tanto con los números y metele garra. 💪`,
          (p) => `Tu meta diaria calculada es de **${p.targetKcal} kcal**. Usalo como guía, no como ley — lo importante es que comas variado y rico. 🙌`,
          (p) => `Según tu perfil, deberías rondar las **${p.targetKcal} kcal** por día. Tomalo como referencia y ajustá según cómo te sientas. 😊`
        ], profile);
      }
      return this.pickVariant('dieta_sin_perfil', [
        `Para no andar tirando fruta, te sugiero mirar las calorías asignadas directamente en la solapa de tu Perfil.`
      ]);
    }

    // --- Recetas / cocinar / comer ---
    if (msg.includes('receta') || msg.includes('cocinar') || msg.includes('comer')) {
      if (profile && profile.restrictions && profile.restrictions.length) {
        return this.pickVariant('receta_con_restricciones', [
          (p) => `Ya agendé tus mañas de alimentación: "${p.restrictions.join(', ')}". Si vas a las pestañas de **Inicio** o **Semana**, vas a ver las recetas ricas que armé cuidando tu perfil. 🥗`,
          (p) => `Tengo anotado que evitás: ${p.restrictions.join(', ')}. Fijate en **Inicio** o **Semana**, ahí te armé opciones que respetan eso. 🍽️`
        ], profile);
      }
      return this.pickVariant('receta_sin_restricciones', [
        `¡Uff, alta hora para comer! Pegale una mirada a la solapa de **Inicio** o **Semana**. Te armé un menú personalizado espectacular para tu objetivo.`,
        `Dale, andá a **Inicio** o **Semana** que ahí tenés el menú pensado para vos según tu objetivo. ¡A comer rico! 🍴`
      ]);
    }

    // --- No me gusta / alergias / evitar ---
    if (msg.includes('no me gusta') || msg.includes('alerg') || msg.includes('evitar')) {
      return this.pickVariant('alergia', [
        `Che, si hay cosas que te dan alergia o te caen como una patada, podés resetear la app abajo de todo en tu Perfil y armamos el Onboarding de cero en dos patadas.`,
        `Si notás que algo te cae mal o te da alergia, resetealo desde tu Perfil (al final de todo) y rehacemos el Onboarding tranquilo.`
      ]);
    }

    // --- Agradecimientos ---
    if (msg.includes('gracias') || msg.includes('bueno') || msg.includes('joya') || msg.includes('genial') || msg.includes('de diez')) {
      return this.pickVariant('gracias', [
        `¡De nada, genio/a! Si sentís olor a quemado en la cocina, chiflá que lo resolvemos. 😎`,
        `¡De una! Cualquier cosita, ya sabés, acá ando. 🙌`,
        `¡Buenísimo! Me alegro que te sirva. Seguimos en contacto por acá. 😄`
      ]);
    }

    // --- Default ---
    return this.pickVariant('default', [
      `Mirá, me mataste con esa pregunta, pero te lo resumo al estilo NutriO: seguí metiéndole pilas, no te tientes con el delivery de hamburguesas y consultame lo que quieras. 😉`,
      `Uy, esa me la tenés que explicar mejor jaja. Mientras tanto, dale para adelante y consultame lo que necesites. 😉`,
      `No estoy 100% seguro de esa, pero mientras tanto: metele con todo, evitá el delivery a las 3am, y preguntame cualquier cosa de comida. 🍽️`
    ]);
  }
};

window.addEventListener('DOMContentLoaded', () => { UI.init(); })
