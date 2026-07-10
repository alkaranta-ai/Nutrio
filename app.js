// ARMADO DE PERFIL — pantalla única, sin pasos.
//
// El formulario se completa y se valida en una sola pantalla con Onboarding.finish().
// RECIPES_DB, CATEGORY_META y MealEngine viven en js/data.js (se carga antes que este archivo).

// Colores de acento por categoría, para darle vida visual a las tarjetas de
// Inicio y al modal de receta. Es solo presentación, no toca data.js.
const CATEGORY_ACCENTS = {
  desayuno: { color: '#f59e0b', dim: '#fff7ed' },
  almuerzo: { color: '#22c55e', dim: '#f0fdf4' },
  meriendas: { color: '#ec4899', dim: '#fdf2f8' },
  cena: { color: '#6366f1', dim: '#eef2ff' }
};

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

  // Comidas de HOY, resueltas por MealEngine contra el perfil
  renderHome() {
    const profile = StorageApp.getProfile();
    if (!profile) return;
    document.getElementById('homeGreeting').innerText = `¡Hola, ${profile.name}!`;
    document.getElementById('kcalDisplayTarget').innerText = `Tu requerimiento diario: ${profile.targetKcal} kcal / Objetivo Activo.`;

    const container = document.getElementById('dayMealsContainer');
    if (!container) return;

    const today = new Date();
    const meals = [
      { slot: 'desayuno', label: 'Desayuno', recipe: MealEngine.getMealForDate('desayuno', profile, today) },
      { slot: 'almuerzo', label: 'Almuerzo', recipe: MealEngine.getMealForDate('almuerzo', profile, today) },
      { slot: 'meriendas', label: 'Merienda', recipe: MealEngine.getMealForDate('meriendas', profile, today) },
      { slot: 'cena', label: 'Cena', recipe: MealEngine.getMealForDate('cena', profile, today) }
    ];

    container.innerHTML = `<div class="meal-card-grid">${meals.map(m => this._renderMealCard(m)).join('')}</div>`;
  },

  _renderMealCard({ slot, label, recipe }) {
    const accent = CATEGORY_ACCENTS[slot] || CATEGORY_ACCENTS.almuerzo;
    const icon = (CATEGORY_META[slot] && CATEGORY_META[slot].icon) || '🍽️';
    const preview = recipe.ingredients.slice(0, 3).join(', ') + (recipe.ingredients.length > 3 ? '…' : '');

    return `
      <div class="meal-card" style="--accent:${accent.color}; --accent-dim:${accent.dim};" onclick="UI.openRecipeModal('${recipe.id}')">
        <div class="meal-icon">${icon}</div>
        <div class="meal-card-body">
          <div class="meal-card-top">
            <span class="meal-card-label">${label}</span>
            <span class="meal-card-kcal">${recipe.kcal} kcal</span>
          </div>
          <div class="meal-card-name">${recipe.name}</div>
          <div class="meal-card-ingredients">${preview}</div>
          <div class="meal-card-hint">Toca para ver la receta completa →</div>
        </div>
      </div>
    `;
  },

  // Abre el modal flotante con ingredientes (como chips) y preparación paso a paso.
  openRecipeModal(recipeId) {
    const recipe = RECIPES_DB.find(r => r.id === recipeId);
    if (!recipe) return;
    const meta = CATEGORY_META[recipe.category] || {};

    const content = document.getElementById('recipeModalContent');
    content.innerHTML = `
      <div class="recipe-modal-header">
        <span class="recipe-badge">${meta.icon || ''} ${meta.label || recipe.category}</span>
        <button class="modal-close" onclick="UI.closeRecipeModal()">✕</button>
      </div>
      <h2>${recipe.name}</h2>
      <span class="modal-kcal-pill">${recipe.kcal} kcal</span>
      ${recipe.country && recipe.country !== 'General'
        ? `<span class="modal-kcal-pill" style="margin-left:8px; background:var(--bg); color:var(--text-muted);">${recipe.country}</span>`
        : ''}

      <div class="modal-section-title">Ingredientes</div>
      <div class="ingredient-chip-list">
        ${recipe.ingredients.map(ing => `<span class="ingredient-chip">${ing}</span>`).join('')}
      </div>

      <div class="modal-section-title">Preparación</div>
      <ol class="instructions-list">
        ${recipe.instructions && recipe.instructions.length 
          ? recipe.instructions.map(step => `<li>${step}</li>`).join('') 
          : `<li>Picar los ingredientes y cocinar a fuego moderado hasta su punto óptimo.</li>`}
      </ol>
    `;

    document.getElementById('recipeModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeRecipeModal() {
    document.getElementById('recipeModal').classList.remove('active');
    document.body.style.overflow = '';
  },

  closeRecipeModalOnOverlay(event) {
    if (event.target && event.target.id === 'recipeModal') this.closeRecipeModal();
  },

  // Próximos 7 días ahora con tarjetas interactivas vinculadas al modal nativo.
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
        <div class="card" style="margin-bottom:16px; padding:16px; border-radius:12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:6px;">
            <h3 style="color:var(--primary); margin:0;">${dayLabel}</h3>
            <span style="font-size:12px; font-weight:bold; color:var(--primary); background:var(--primary-dim); padding:4px 10px; border-radius:20px;">Menú diario interactivo</span>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div style="cursor:pointer; padding:4px;" onclick="UI.openRecipeModal('${meals.desayuno.id}')" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
              <p style="font-size:14px; color:var(--text); margin:0;">☕ <b>Desayuno:</b> ${meals.desayuno.name} <span style="color:var(--text-muted); font-size:12px;">(${meals.desayuno.kcal} kcal) →</span></p>
            </div>
            <div style="cursor:pointer; padding:4px;" onclick="UI.openRecipeModal('${meals.almuerzo.id}')" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
              <p style="font-size:14px; color:var(--text); margin:0;">🥗 <b>Almuerzo:</b> ${meals.almuerzo.name} <span style="color:var(--text-muted); font-size:12px;">(${meals.almuerzo.kcal} kcal) →</span></p>
            </div>
            <div style="cursor:pointer; padding:4px;" onclick="UI.openRecipeModal('${meals.meriendas.id}')" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
              <p style="font-size:14px; color:var(--text); margin:0;">🥞 <b>Merienda:</b> ${meals.meriendas.name} <span style="color:var(--text-muted); font-size:12px;">(${meals.meriendas.kcal} kcal) →</span></p>
            </div>
            <div style="cursor:pointer; padding:4px;" onclick="UI.openRecipeModal('${meals.cena.id}')" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">
              <p style="font-size:14px; color:var(--text); margin:0;">🍽️ <b>Cena:</b> ${meals.cena.name} <span style="color:var(--text-muted); font-size:12px;">(${meals.cena.kcal} kcal) →</span></p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

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

  // SOLUCIÓN: Lista persistente, estados de checkboxes guardados por fecha y módulo de Historial integrado.
  renderCart() {
    const cart = StorageApp.getCart();
    const container = document.getElementById('cartCard');
    if (!container) return;

    if (!cart || cart.length === 0) {
      container.innerHTML = `<p class="muted" style="text-align:center; padding: 20px;">🛒 Tu lista semanal está vacía.</p>`;
      return;
    }

    // Clave para mapear los estados de checks correspondientes al día de HOY
    const fechaHoyStr = new Date().toLocaleDateString('es-AR');
    let tildadosHoy = JSON.parse(localStorage.getItem(`nutrio_checked_${fechaHoyStr}`)) || [];

    const categorias = {
      "🥦 Verdulería / Frutería": ['zanahoria', 'arvejas', 'cebolla', 'tomate', 'lechuga', 'espinaca', 'palta', 'limón', 'manzana', 'banana', 'fruta', 'ajo', 'morrón', 'papa', 'zapallo'],
      "🍗 Carnes y Proteínas": ['pollo', 'pechuga', 'carne', 'lomo', 'huevo', 'huevos', 'pescado', 'atún', 'salmón', 'bife', 'cerdo'],
      "🌾 Almacén y Lácteos": ['arroz', 'integral', 'ricota', 'miel', 'yogur', 'cereal', 'avena', 'leche', 'queso', 'aceite', 'oliva', 'pan', 'fideos', 'harina', 'legumbres']
    };

    const fuentesAgrupadas = { "🥦 Verdulería / Frutería": [], "🍗 Carnes y Proteínas": [], "🌾 Almacén y Lácteos": [], "📦 Gondola General / Otros": [] };

    cart.forEach(item => {
      let categorizado = false;
      const itemLower = item.toLowerCase();
      
      for (const [catName, keywords] of Object.entries(categorias)) {
        if (keywords.some(kw => itemLower.includes(kw))) {
          fuentesAgrupadas[catName].push(item);
          categorizado = true;
          break;
        }
      }
      if (!categorizado) fuentesAgrupadas["📦 Gondola General / Otros"].push(item);
    });

    let htmlResultado = '<div id="liveShoppingList">';

    for (const [categoria, items] of Object.entries(fuentesAgrupadas)) {
      if (items.length === 0) continue;

      htmlResultado += `
        <div style="margin-bottom: 20px;">
          <h4 style="color: var(--primary); border-bottom: 1px solid var(--primary-dim); padding-bottom: 4px; margin-bottom: 10px; font-size: 15px;">${categoria}</h4>
      `;

      htmlResultado += items.map((item) => {
        const isChecked = tildadosHoy.includes(item);
        return `
          <div class="cart-item" style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 4px 0;">
            <input type="checkbox" class="shop-item-check" data-item="${item}" ${isChecked ? 'checked' : ''}
                   style="transform: scale(1.2); accent-color: var(--primary); cursor: pointer;" 
                   onclick="UI.toggleCartItemCheck(this, '${item}')">
            <span style="flex: 1; font-size: 14px; transition: all 0.2s; ${isChecked ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${item}</span>
          </div>
        `;
      }).join('');

      htmlResultado += `</div>`;
    }

    htmlResultado += `
      <button onclick="UI.checkoutPurchasedItems()" 
              style="width: 100%; margin-top: 15px; background: var(--primary); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px var(--primary-dim);">
        🛒 Guardar en Carrito del Día (${fechaHoyStr})
      </button>
    </div>`;

    // AGREGAMOS SECCIÓN DE HISTORIAL DE COMPRAS AL FINAL
    let comprasHistorial = JSON.parse(localStorage.getItem('nutrio_shopping_history')) || [];
    
    htmlResultado += `
      <div style="margin-top: 35px; border-top: 2px dashed rgba(0,0,0,0.06); padding-top: 20px;">
        <h3 style="color: var(--text); font-size: 16px; margin-bottom: 12px; display:flex; align-items:center; gap:6px;">🗃️ Carrito e Historial de Compras</h3>
    `;

    if (comprasHistorial.length === 0) {
      htmlResultado += `<p style="font-size:13px; color:var(--text-muted); text-align:center; padding:10px; background:rgba(0,0,0,0.01); border-radius:8px;">Aún no realizaste cierres de compra. Lo tildado arriba se guardará acá.</p>`;
    } else {
      // Mostrar de más nuevo a más viejo
      htmlResultado += comprasHistorial.map(entry => `
        <div style="background: var(--bg); border: 1px solid rgba(0,0,0,0.05); padding: 12px; border-radius: 10px; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:bold; color:var(--primary); margin-bottom:6px;">
            <span>🗓️ Compras del Día: ${entry.date}</span>
            <span style="background:var(--primary-dim); padding:1px 6px; border-radius:6px;">${entry.items.length} art.</span>
          </div>
          <p style="font-size:13px; color:var(--text-muted); line-height:1.4; margin:0;">${entry.items.join(', ')}</p>
        </div>
      `).join('');
    }

    htmlResultado += `</div>`;
    container.innerHTML = htmlResultado;
  },

  // Guarda dinámicamente qué tildaste hoy para que al recargar no se pierda el progreso de tu caminata por el súper
  toggleCartItemCheck(checkbox, item) {
    const fechaHoyStr = new Date().toLocaleDateString('es-AR');
    let tildadosHoy = JSON.parse(localStorage.getItem(`nutrio_checked_${fechaHoyStr}`)) || [];

    if (checkbox.checked) {
      if (!tildadosHoy.includes(item)) tildadosHoy.push(item);
      checkbox.nextElementSibling.style.textDecoration = 'line-through';
      checkbox.nextElementSibling.style.opacity = '0.5';
    } else {
      tildadosHoy = tildadosHoy.filter(v => v !== item);
      checkbox.nextElementSibling.style.textDecoration = 'none';
      checkbox.nextElementSibling.style.opacity = '1';
    }

    localStorage.setItem(`nutrio_checked_${fechaHoyStr}`, JSON.stringify(tildadosHoy));
  },

  // Agrega los elementos tildados al Historial de Compras de la fecha y limpia la vista superior sin romper el perfil
  checkoutPurchasedItems() {
    const fechaHoyStr = new Date().toLocaleDateString('es-AR');
    const tildadosHoy = JSON.parse(localStorage.getItem(`nutrio_checked_${fechaHoyStr}`)) || [];

    if (tildadosHoy.length === 0) {
      alert("¡Che! Primero tildá en la lista los artículos que ya metiste al changuito físico.");
      return;
    }

    let comprasHistorial = JSON.parse(localStorage.getItem('nutrio_shopping_history')) || [];
    
    // Buscamos si ya hay un registro de hoy para anexar, o creamos una entrada nueva
    const registroExistente = comprasHistorial.find(entry => entry.date === fechaHoyStr);
    if (registroExistente) {
      tildadosHoy.forEach(item => {
        if (!registroExistente.items.includes(item)) registroExistente.items.push(item);
      });
    } else {
      comprasHistorial.unshift({
        date: fechaHoyStr,
        items: [...tildadosHoy]
      });
    }

    // Persistimos el historial general
    localStorage.setItem('nutrio_shopping_history', JSON.stringify(comprasHistorial));

    // Limpiamos los checks de hoy para que la lista principal aparezca libre y limpia
    localStorage.removeItem(`nutrio_checked_${fechaHoyStr}`);

    // Renderizamos de vuelta
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
