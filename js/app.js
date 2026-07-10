// ARMADO DE PERFIL — pantalla única, sin pasos.
// El formulario se completa y se valida en una sola pantalla con Onboarding.finish().

const CATEGORY_ACCENTS = {
  desayuno: { color: '#f59e0b', dim: '#fff7ed' },
  almuerzo: { color: '#22c55e', dim: '#f0fdf4' },
  meriendas: { color: '#ec4899', dim: '#fdf2f8' },
  cena: { color: '#6366f1', dim: '#eef2ff' }
};

// ==========================================
// MÓDULO DE EMULACIÓN DE CHAT ADAPTATIVO
// ==========================================
const ChatApp = {
  getGreeting(profile) {
    if (profile.chatStyle === 'humor' || profile.chatStyle === 'amigable') {
      return `¡Buenas, ${profile.name}! Acá está tu asistente personal. Vi que tu meta son ${profile.targetKcal} kcal para <b>${profile.goals[0].replace('_', ' ')}</b>. Decime, ¿qué cocinamos hoy o qué duda tenés? (Prometo no juzgar si metés un permitido 😉).`;
    }
    return `Hola ${profile.name}. Tu plan de ${profile.targetKcal} kcal diarias está activo. ¿En qué puedo ayudarte?`;
  },

  getBotResponse(msg, profile) {
    const text = msg.toLowerCase();
    const style = profile.chatStyle || 'amigable';
    
    if (style === 'humor' || style === 'amigable') {
      if (text.includes('hola') || text.includes('buenas')) {
        return `¡Qué hacés, che! Todo tranqui por acá. ¿Qué sale hoy? ¿Cocinamos algo rico o venís a controlarme las kcal? 🍳`;
      }
      if (text.includes('hambre') || text.includes('permitido') || text.includes('antojo')) {
        return `Ufff, te entiendo tanto. El hambre es miembro honorario de este chat. Si vas a clavar permitido, que sea con orgullo. Si no, metele a un snack de los que te sugerí en la pestaña de meriendas, ¡no me hagas trampa! 🍫✨`;
      }
      if (text.includes('reemplazo') || text.includes('cambiar') || text.includes('no tengo')) {
        return `¡Ningún drama! Si te falta ese ingrediente, vamo' a lo práctico: cambialo por lo que tengas en la heladera que sea parecido. Si era pollo, mandale carne o huevo. Tampoco nos vamos a poner en modo chef de TV, acá se resuelve fácil. 💡`;
      }
      if (text.includes('gracias') || text.includes('bueno')) {
        return `¡De nada, genio/a! Para eso estoy. Cualquier cosa que huela a quemado en la cocina, me chiflás. ¡Abrazo! 💪`;
      }
      return `Mirá, me mataste con esa pregunta, pero te lo resumo al estilo NutriO: seguí metiéndole ganas a tu meta de ${profile.targetKcal} kcal y no te obsesiones tanto. ¿Querés que busquemos otra receta o preferís charlar de otra cosa?`;
    }

    return `Entendido. Con base en tu perfil enfocado en "${profile.goals[0]}", te recomiendo ajustar las porciones según los macros calculados (${profile.targetKcal} kcal). ¿Deseas sustitutos específicos para algún ingrediente?`;
  }
};

// ==========================================
// MÓDULO PRINCIPAL DE LA INTERFAZ (UI)
// ==========================================
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

    const missingRequired = !name || !age || !weight || !height || !this.selected.activity || !this.selected.goal;
    const invalidNumbers = Number(age) <= 0 || Number(weight) <= 0 || Number(height) <= 0;

    if (missingRequired || invalidNumbers) {
      errorBox.classList.add('show');
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    errorBox.classList.remove('show');

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
      allergies: document.getElementById('fAllergies').value.trim() ? document.getElementById('fAllergies').value.split(',').map(s => s.trim()) : [],
      restrictions: this.selected.restrictions,
      dislikes: document.getElementById('fDislikes').value.trim() ? document.getElementById('fDislikes').value.split(',').map(s => s.trim()) : [],
      mealsPerDay: this.selected.mealsPerDay || '3',
      cookTime: this.selected.cookTime || 'moderado',
      budget: this.selected.budget || 'medio',
      waterGlasses: parseInt(document.getElementById('fWaterGlasses').value, 10) || null,
      sleepHours: parseFloat(document.getElementById('fSleepHours').value) || null,
      cuisines: this.selected.cuisines.filter(v => v !== 'sin_preferencia'),
      favoriteFoods: document.getElementById('fFavoriteFoods').value.trim() ? document.getElementById('fFavoriteFoods').value.split(',').map(s => s.trim()) : [],
      chatStyle: this.selected.chatStyle || 'amigable',
      chatCustomNote: document.getElementById('fChatCustom').value.trim() || ''
    };

    profile.targetKcal = this._calculateTargetKcal(profile);
    StorageApp.saveProfile(profile);
    UI.regenerateCartForWeek();
    UI.init();
  },

  _calculateTargetKcal(profile) {
    let tmb = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
    tmb = profile.sex === 'masculino' ? tmb + 5 : tmb - 161;
    const factors = { sedentario: 1.2, ligero: 1.375, moderado: 1.55, activo: 1.725, muy_activo: 1.9 };
    let target = Math.round(tmb * (factors[profile.activity] || 1.2));
    if (profile.goals[0] === 'bajar_peso') target -= 400;
    if (profile.goals[0] === 'subir_peso') target += 400;
    return target;
  }
};

const UI = {
  init() {
    // FIX: Siempre inicializamos la escucha de clics en los chips, esté o no guardado el perfil.
    Onboarding.bindAllChips();

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
    this.renderChatGreeting(profile);
    this.goto('chat');
  },

  goto(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.dock-item').forEach(b => b.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) target.classList.add('active');
    
    const viewsOrder = ['chat', 'inicio', 'semana', 'carrito', 'perfil'];
    const idx = viewsOrder.indexOf(viewName);
    if (document.querySelectorAll('.dock-item')[idx]) {
      document.querySelectorAll('.dock-item')[idx].classList.add('active');
    }
    document.getElementById('chatInputBar').style.display = viewName === 'chat' ? 'block' : 'none';
  },

  renderHome() {
    const profile = StorageApp.getProfile();
    if (!profile) return;
    document.getElementById('homeGreeting').innerText = `¡Hola, ${profile.name}!`;
    document.getElementById('kcalDisplayTarget').innerText = `Tu requerimiento diario: ${profile.targetKcal} kcal.`;

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
    return `
      <div class="meal-card" style="--accent:${accent.color}; --accent-dim:${accent.dim};" onclick="UI.openRecipeModal('${recipe.id}')">
        <div class="meal-icon">${CATEGORY_META[slot]?.icon || '🍽️'}</div>
        <div class="meal-card-body">
          <div class="meal-card-top">
            <span class="meal-card-label">${label}</span>
            <span class="meal-card-kcal">${recipe.kcal} kcal</span>
          </div>
          <div class="meal-card-name">${recipe.name}</div>
          <div class="meal-card-hint">Toca para ver receta →</div>
        </div>
      </div>
    `;
  },

  openRecipeModal(recipeId) {
    const recipe = RECIPES_DB.find(r => r.id === recipeId);
    if (!recipe) return;
    document.getElementById('recipeModalContent').innerHTML = `
      <div class="recipe-modal-header"><h2>${recipe.name}</h2><button class="modal-close" onclick="UI.closeRecipeModal()">✕</button></div>
      <p><b>Ingredientes:</b></p><ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
    `;
    document.getElementById('recipeModal').classList.add('active');
  },

  closeRecipeModal() { document.getElementById('recipeModal').classList.remove('active'); },

  renderWeeklyPlan() {
    const container = document.getElementById('weeklyPlanContainer');
    if (!container) return;
    const profile = StorageApp.getProfile();
    const plan = MealEngine.getPlanForDays(profile, new Date(), 7);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    container.innerHTML = plan.map(({ date, meals }) => `
      <div class="card" style="margin-bottom:12px; padding:12px;">
        <h4>${days[date.getDay()]}</h4>
        <p onclick="UI.openRecipeModal('${meals.desayuno.id}')">☕ Desayuno: ${meals.desayuno.name}</p>
        <p onclick="UI.openRecipeModal('${meals.almuerzo.id}')">🥗 Almuerzo: ${meals.almuerzo.name}</p>
        <p onclick="UI.openRecipeModal('${meals.cena.id}')">🍽️ Cena: ${meals.cena.name}</p>
      </div>
    `).join('');
  },

  regenerateCartForWeek() {
    const profile = StorageApp.getProfile();
    if (!profile) return;
    const plan = MealEngine.getPlanForDays(profile, new Date(), 7);
    const items = new Set();
    plan.forEach(d => Object.values(d.meals).forEach(r => r.ingredients.forEach(i => items.add(i))));
    StorageApp.saveCart(Array.from(items));
  },

  renderCart() {
    const cart = StorageApp.getCart();
    const container = document.getElementById('cartCard');
    if (!container) return;

    const hoyKey = new Date().toLocaleDateString('es-AR');
    let tildadosHoy = JSON.parse(localStorage.getItem(`nutrio_checked_${hoyKey}`)) || [];

    let html = '<div>';
    cart.forEach(item => {
      const isChecked = tildadosHoy.includes(item);
      html += `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
          <input type="checkbox" data-item="${item}" ${isChecked ? 'checked' : ''} onclick="UI.handleCheck(this, '${item}')">
          <span style="${isChecked ? 'text-decoration:line-through; opacity:0.5;' : ''}">${item}</span>
        </div>
      `;
    });

    html += `
      <button onclick="UI.archivePurchases()" style="width:100%; margin-top:15px; background:var(--primary); color:white; border:none; padding:10px; border-radius:6px; font-weight:bold; cursor:pointer;">
        🛒 Archivar lo comprado hoy (${hoyKey})
      </button>
    </div>`;

    let historial = JSON.parse(localStorage.getItem('nutrio_history')) || [];
    html += `<div style="margin-top:20px; border-top:1px dashed #ccc; padding-top:15px;"><h4>📦 Historial de compras guardadas</h4>`;
    if (historial.length === 0) {
      html += `<p style="font-size:12px; color:gray;">No hay registros de días anteriores.</p>`;
    } else {
      historial.forEach(h => {
        html += `<p style="font-size:12px; margin-bottom:4px;"><b>Día ${h.date}:</b> ${h.items.join(', ')}</p>`;
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
    if (tildadosHoy.length === 0) return alert("Tildá algún ingrediente primero.");

    let historial = JSON.parse(localStorage.getItem('nutrio_history')) || [];
    historial.unshift({ date: hoyKey, items: tildadosHoy });
    localStorage.setItem('nutrio_history', JSON.stringify(historial));
    
    localStorage.removeItem(`nutrio_checked_${hoyKey}`);
    alert("¡Guardado en tu historial! Mañana tu lista amanecerá limpia para nuevas compras.");
    this.renderCart();
  },

  renderProfile() {
    const p = StorageApp.getProfile();
    if (!p) return;
    document.getElementById('profileNameDisplay').innerText = p.name;
    document.getElementById('profilePrefsDisplay').innerHTML = `<b>Meta:</b> ${p.targetKcal} kcal <br> <b>Estilo Chat:</b> ${p.chatStyle}`;
  },

  sendChat() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();
    const scroll = document.getElementById('chatScroll');

    scroll.innerHTML += `<div style="text-align:right; margin-bottom:8px;"><span style="background:var(--primary-dim); padding:6px 12px; border-radius:12px; display:inline-block;">${msg}</span></div>`;
    input.value = '';

    setTimeout(() => {
      const p = StorageApp.getProfile();
      const res = ChatApp.getBotResponse(msg, p);
      scroll.innerHTML += `<div style="text-align:left; margin-bottom:8px;"><span style="background:var(--bg); padding:6px 12px; border-radius:12px; display:inline-block;">${res}</span></div>`;
      scroll.scrollTop = scroll.scrollHeight;
    }, 300);
  },

  resetAll() { localStorage.clear(); location.reload(); }
};

window.addEventListener('DOMContentLoaded', () => { UI.init(); });
