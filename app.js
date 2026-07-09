// NOTA: RECIPES_DB, getRecipesByCategory y CATEGORY_META viven en js/data.js
// (antes estaba duplicado acá también, lo que rompía la app con un error de JS)

const Onboarding = {
  currentStep: 0,
  data: { goals: [] },

  next() {
    const steps = document.querySelectorAll('.onb-step');
    if (!steps[this.currentStep]) return;
    steps[this.currentStep].classList.remove('active');
    this.currentStep++;
    if (steps[this.currentStep]) {
      steps[this.currentStep].classList.add('active');
    }
    this.updateDots();
  },

  prev() {
    if (this.currentStep === 0) return;
    const steps = document.querySelectorAll('.onb-step');
    steps[this.currentStep].classList.remove('active');
    this.currentStep--;
    steps[this.currentStep].classList.add('active');
    this.updateDots();
  },

  updateDots() {
    const dotsContainer = document.getElementById('onbDots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const totalSteps = document.querySelectorAll('.onb-step').length;
    for (let i = 0; i < totalSteps; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === this.currentStep ? 'active' : ''}`;
      dotsContainer.appendChild(dot);
    }
  },

  validateStep1() {
    const name = document.getElementById('fName').value;
    const age = document.getElementById('fAge').value;
    const weight = document.getElementById('fWeight').value;
    const height = document.getElementById('fHeight').value;

    if (!name || !age || !weight || !height) {
      alert('Por favor, completa todos los casilleros obligatorios.');
      return;
    }
    this.data.name = name;
    this.data.age = parseInt(age);
    this.data.weight = parseFloat(weight);
    this.data.height = parseFloat(height);
    this.data.sex = document.getElementById('fSex').value;
    this.next();
  },

  validateStep2() {
    if (!this.data.goals || this.data.goals.length === 0) {
      alert('Selecciona un objetivo para tus platos.');
      return;
    }
    this.next();
  },

  finish() {
    let tmb = 10 * this.data.weight + 6.25 * this.data.height - 5 * this.data.age;
    tmb = this.data.sex === 'masculino' ? tmb + 5 : tmb - 161;
    let targetKcal = Math.round(tmb * 1.3);

    if (this.data.goals[0] === 'bajar_peso') targetKcal -= 400;
    if (this.data.goals[0] === 'subir_peso') targetKcal += 400;

    this.data.targetKcal = targetKcal;

    StorageApp.saveProfile(this.data);
    this.autoGenerateCart();
    UI.init();
  },

  autoGenerateCart() {
    let itemsSet = new Set();
    RECIPES_DB.forEach(r => {
      r.ingredients.forEach(ing => itemsSet.add(ing));
    });
    StorageApp.saveCart(Array.from(itemsSet));
  }
};

const UI = {
  init() {
    const profile = StorageApp.getProfile();
    if (!profile) {
      document.getElementById('onboarding').style.display = 'flex';
      document.getElementById('app').style.display = 'none';
      Onboarding.updateDots();
      this.bindChips();
      return;
    }

    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    this.renderHome();
    this.renderWeeklyPlan();
    this.renderCart();
    this.renderProfile();
    this.goto('chat'); // Abre el chat primero
  },

  bindChips() {
    const group = document.getElementById('goalChips');
    if (!group) return;
    group.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      Onboarding.data.goals = [chip.dataset.val];
    });
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

  // Devuelve un índice "del día" estable (0-6) para rotar recetas sin repetir siempre las mismas
  getDayOffset() {
    const jsDay = new Date().getDay(); // 0 = domingo ... 6 = sábado
    return (jsDay + 6) % 7; // reacomodado para que 0 = lunes
  },

  renderHome() {
    const profile = StorageApp.getProfile();
    if (!profile) return;
    document.getElementById('homeGreeting').innerText = `¡Hola, ${profile.name}!`;
    document.getElementById('kcalDisplayTarget').innerText = `Tu requerimiento diario: ${profile.targetKcal} kcal / Objetivo Activo.`;

    const container = document.getElementById('dayMealsContainer');
    if (!container) return;

    const dayIdx = this.getDayOffset();
    const desayunos = getRecipesByCategory('desayuno');
    const almuerzos = getRecipesByCategory('almuerzo');
    const meriendas = getRecipesByCategory('meriendas');
    const cenas = getRecipesByCategory('cena');

    const breakfast = desayunos[dayIdx % desayunos.length];
    const lunch = almuerzos[dayIdx % almuerzos.length];
    const snack = meriendas[dayIdx % meriendas.length];
    const dinner = cenas[dayIdx % cenas.length];

    const meals = [
      { r: breakfast, slot: 'desayuno' },
      { r: lunch, slot: 'almuerzo' },
      { r: snack, slot: 'meriendas' },
      { r: dinner, slot: 'cena' }
    ];

    container.innerHTML = `
      <div class="card">
        ${meals.map(m => `
          <div class="meal-slot" onclick="UI.showRecipe('${m.r.id}')">
            <div class="meal-title">${CATEGORY_META[m.slot].icon} ${CATEGORY_META[m.slot].label}</div>
            <h3>${m.r.name}</h3>
            <p style="font-size:13px; color:var(--text-muted);">${m.r.kcal} kcal • ${m.r.ingredients.join(', ')}</p>
            <span class="tap-hint">Ver receta →</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderWeeklyPlan() {
    const container = document.getElementById('weeklyPlanContainer');
    if (!container) return;

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const almuerzos = getRecipesByCategory('almuerzo');
    const cenas = getRecipesByCategory('cena');

    container.innerHTML = days.map((day, idx) => {
      const mainPlate = almuerzos[idx % almuerzos.length];
      const dinnerPlate = cenas[idx % cenas.length];
      return `
        <div class="card" style="margin-bottom:12px;">
          <h3 style="color:var(--primary); margin-bottom:6px;">${day}</h3>
          <div class="meal-slot" onclick="UI.showRecipe('${mainPlate.id}')">
            <p style="font-size:14px; color:var(--text);"><b>${CATEGORY_META.almuerzo.icon} Almuerzo:</b> ${mainPlate.name} (${mainPlate.kcal} kcal)</p>
            <span class="tap-hint">Ver receta →</span>
          </div>
          <div class="meal-slot" onclick="UI.showRecipe('${dinnerPlate.id}')">
            <p style="font-size:14px; color:var(--text);"><b>${CATEGORY_META.cena.icon} Cena:</b> ${dinnerPlate.name} (${dinnerPlate.kcal} kcal)</p>
            <span class="tap-hint">Ver receta →</span>
          </div>
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
    document.getElementById('profileMetaDisplay').innerText = `Meta diaria asignada: ${profile.targetKcal} calorías semanales adaptadas a tu cuerpo.`;
  },

  // Abre el modal con ingredientes y preparación de una receta
  showRecipe(id) {
    const r = RECIPES_DB.find(x => x.id === id);
    if (!r) return;
    const modal = document.getElementById('recipeModal');
    const content = document.getElementById('recipeModalContent');
    const meta = CATEGORY_META[r.category] || { icon: '🍴', label: r.category };

    content.innerHTML = `
      <div class="recipe-modal-header">
        <span class="recipe-badge">${meta.icon} ${meta.label} • ${r.kcal} kcal</span>
        <button class="modal-close" onclick="UI.closeRecipeModal()">✕</button>
      </div>
      <h2>${r.name}</h2>
      <h3 style="margin-top:16px;">Ingredientes</h3>
      <ul class="recipe-list">${r.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
      <h3 style="margin-top:16px;">Preparación</h3>
      <ol class="recipe-list">${(r.instructions && r.instructions.length ? r.instructions : ['Sin instrucciones detalladas para esta receta.']).map(s => `<li>${s}</li>`).join('')}</ol>
    `;
    modal.classList.add('active');
  },

  closeRecipeModal() {
    document.getElementById('recipeModal').classList.remove('active');
  },

  sendChat() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();

    const scroll = document.getElementById('chatScroll');
    scroll.innerHTML += `<div style="text-align:right; margin-bottom:10px;"><span style="background:var(--primary-dim); color:var(--primary); padding:8px 12px; border-radius:12px; display:inline-block; font-size:14px;">${msg}</span></div>`;

    input.value = '';

    setTimeout(() => {
      const response = ChatApp.getBotResponse(msg);
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
