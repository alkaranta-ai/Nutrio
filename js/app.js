// NOTA: RECIPES_DB ahora vive únicamente en js/data.js (se carga antes que este archivo).
// Antes estaba declarado con "const" en los dos archivos a la vez, lo cual tira
// un SyntaxError ("Identifier 'RECIPES_DB' has already been declared") y frena
// todo el JS de la página. Por eso nada funcionaba, ni el botón "Empezar".

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

  renderHome() {
    const profile = StorageApp.getProfile();
    if (!profile) return;
    document.getElementById('homeGreeting').innerText = `¡Hola, ${profile.name}!`;
    document.getElementById('kcalDisplayTarget').innerText = `Tu requerimiento diario: ${profile.targetKcal} kcal / Objetivo Activo.`;

    const container = document.getElementById('dayMealsContainer');
    if (!container) return;

    // Selección segura de índices basada en calorías (Evita el error de índice fuera de rango)
    const isHigh = profile.targetKcal > 1700;
    const breakfast = isHigh ? RECIPES_DB[1] : RECIPES_DB[0];
    const lunch = isHigh ? RECIPES_DB[3] : RECIPES_DB[2];
    const snack = isHigh ? RECIPES_DB[5] : RECIPES_DB[4];
    const dinner = isHigh ? RECIPES_DB[7] : RECIPES_DB[6];

    container.innerHTML = `
      <div class="card">
        <div class="meal-slot"><div class="meal-title">Desayuno</div><h3>${breakfast.name}</h3><p style="font-size:13px; color:var(--text-muted);">${breakfast.kcal} kcal • ${breakfast.ingredients.join(', ')}</p></div>
        <div class="meal-slot"><div class="meal-title">Almuerzo</div><h3>${lunch.name}</h3><p style="font-size:13px; color:var(--text-muted);">${lunch.kcal} kcal • ${lunch.ingredients.join(', ')}</p></div>
        <div class="meal-slot"><div class="meal-title">Merienda</div><h3>${snack.name}</h3><p style="font-size:13px; color:var(--text-muted);">${snack.kcal} kcal • ${snack.ingredients.join(', ')}</p></div>
        <div class="meal-slot"><div class="meal-title">Cena</div><h3>${dinner.name}</h3><p style="font-size:13px; color:var(--text-muted);">${dinner.kcal} kcal • ${dinner.ingredients.join(', ')}</p></div>
      </div>
    `;
  },

  renderWeeklyPlan() {
    const container = document.getElementById('weeklyPlanContainer');
    if (!container) return;

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    container.innerHTML = days.map((day, idx) => {
      const mainPlate = RECIPES_DB[2 + (idx % 2)];
      const dinnerPlate = RECIPES_DB[6 + (idx % 2)];
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
    document.getElementById('profileMetaDisplay').innerText = `Meta diaria asignada: ${profile.targetKcal} calorías semanales adaptadas a tu cuerpo.`;
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
