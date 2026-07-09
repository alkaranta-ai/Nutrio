// SIMULACIÓN DE RECETAS INTELIGENTES AMPLIADAS SEGÚN CALORÍAS
const RECIPES_DB = [
  // Desayunos
  { id: "d1", name: "Pancakes de Avena y Claras", category: "desayuno", kcal: 350, ingredients: ["40g Avena", "3 Claras de huevo", "100g Frutillas"] },
  { id: "d2", name: "Tostadas con Huevo y Aguacate", category: "desayuno", kcal: 450, ingredients: ["2 panes integrales", "1 Huevo entero", "Media palta (aguacate)"] },
  // Almuerzos
  { id: "a1", name: "Pechuga Grillé con Arroz Integral", category: "almuerzo", kcal: 550, ingredients: ["150g Pechuga de pollo", "70g Arroz integral", "Mix de vegetales verdes"] },
  { id: "a2", name: "Filete de Carne con Puré de Calabaza", category: "almuerzo", kcal: 650, ingredients: ["180g Carne magra de res", "200g Calabaza", "1 cdita Aceite de oliva"] },
  // Meriendas
  { id: "m1", name: "Yogur Griego con Nueces y Banana", category: "meriendas", kcal: 300, ingredients: ["200g Yogur natural descremado", "15g Nueces", "Media banana"] },
  { id: "m2", name: "Batido Proteico con Avena", category: "meriendas", kcal: 380, ingredients: ["1 scoop Proteína en polvo", "30g Avena", "250ml Leche descremada"] },
  // Cenas
  { id: "c1", name: "Filete de Pescado con Ensalada Completa", category: "cena", kcal: 400, ingredients: ["150g Pescado blanco", "Tomate", "Lechuga", "Zanahoria"] },
  { id: "c2", name: "Salteado de Pollo y Cubos de Zucchini", category: "cena", kcal: 500, ingredients: ["150g Pollo", "1 Zucchini grande", "Cebolla", "Morrón"] }
];

const Onboarding = {
  currentStep: 0,
  data: { goals: [] },

  next() {
    const steps = document.querySelectorAll('.onb-step');
    steps[this.currentStep].classList.remove('active');
    this.currentStep++;
    steps[this.currentStep].classList.add('active');
    Onboarding.updateDots();
  },

  prev() {
    if (this.currentStep === 0) return;
    const steps = document.querySelectorAll('.onb-step');
    steps[this.currentStep].classList.remove('active');
    this.currentStep--;
    steps[this.currentStep].classList.add('active');
    Onboarding.updateDots();
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
    if (this.data.goals.length === 0) {
      alert('Selecciona un objetivo estratégico.');
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
    
    // Generar automáticamente la lista del súper basada en su perfil calórico
    this.autoGenerateCart(targetKcal);

    UI.init();
  },

  autoGenerateCart(targetKcal) {
    // Tomamos combinaciones fijas semanales ajustadas a sus rangos
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
    this.goto('chat'); // Ahora el Chat abre primero por defecto
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

    // Mapeo preciso de orden físico en el nuevo dock
    const viewsOrder = ['chat', 'inicio', 'semana', 'carrito', 'perfil'];
    const idx = viewsOrder.indexOf(viewName);
    const buttons = document.querySelectorAll('.dock-item');
    if (buttons[idx]) buttons[idx].classList.add('active');

    document.getElementById('chatInputBar').style.display = viewName === 'chat' ? 'block' : 'none';
  },

  renderHome() {
    const profile = StorageApp.getProfile();
    document.getElementById('homeGreeting').innerText = `¡Hola, ${profile.name}!`;
    document.getElementById('kcalDisplayTarget').innerText = `Tu requerimiento diario: ${profile.targetKcal} kcal / Objetivo Activo.`;

    const container = document.getElementById('dayMealsContainer');
    if (!container) return;

    // Filtramos las recetas óptimas para armar el menú del día de Hoy
    const breakfast = profile.targetKcal > 1700 ? RECIPES_DB[1] : RECIPES_DB[0];
    const lunch = profile.targetKcal > 1700 ? RECIPES_DB[3] : RECIPES_DB[2];
    const snack = profile.targetKcal > 1700 ? RECIPES_DB[5] : RECIPES_DB[4];
    const dinner = profile.targetKcal > 1700 ? RECIPES_DB[7] : RECIPES_DB[6];

    container.innerHTML = `
      <div class="card">
        <div class="meal-slot"><div class="meal-title">Desayuno</div><h3>${breakfast.name}</h3><p style="font-size:13px;">${breakfast.kcal} kcal • ${breakfast.ingredients.join(', ')}</p></div>
        <div class="meal-slot"><div class="meal-title">Almuerzo</div><h3>${lunch.name}</h3><p style="font-size:13px;">${lunch.kcal} kcal • ${lunch.ingredients.join(', ')}</p></div>
        <div class="meal-slot"><div class="meal-title">Merienda</div><h3>${snack.name}</h3><p style="font-size:13px;">${snack.kcal} kcal • ${snack.ingredients.join(', ')}</p></div>
        <div class="meal-slot"><div class="meal-title">Cena</div><h3>${dinner.name}</h3><p style="font-size:13px;">${dinner.kcal} kcal • ${dinner.ingredients.join(', ')}</p></div>
      </div>
    `;
  },

  renderWeeklyPlan() {
    const container = document.getElementById('weeklyPlanContainer');
    if (!container) return;

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    container.innerHTML = days.map((day, idx) => {
      // Rotamos platos básicos para simular la agenda completa de la semana de forma dinámica
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
      : cart.map((item, idx) => `
          <div class="cart-item">
            <input type="checkbox" style="transform: scale(1.1); accent-color: var(--primary);">
            <span style="flex:1;">${item}</span>
          </div>
        `).join('');
  },

  renderProfile() {
    const profile = StorageApp.getProfile();
    document.getElementById('profileNameDisplay').innerText = profile.name;
    document.getElementById('profileMetaDisplay').innerText = `Meta diaria asignada: ${profile.targetKcal} calorías semanales adaptadas a tu cuerpo.`;
  },

  sendChat() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();
    
    const scroll = document.getElementById('chatScroll');
    scroll.innerHTML += `<div style="text-align:right;"><span style="background:var(--primary-dim); color:var(--primary); padding:8px 12px; border-radius:12px; display:inline-block; font-size:14px;">${msg}</span></div>`;
    
    input.value = '';
    
    setTimeout(() => {
      const response = ChatApp.getBotResponse(msg);
      scroll.innerHTML += `<div style="text-align:left;"><span style="background:var(--bg); padding:8px 12px; border-radius:12px; display:inline-block; font-size:14px;">${response}</span></div>`;
      scroll.scrollTop = scroll.scrollHeight;
    }, 400);
  },

  resetAll() {
    StorageApp.clearAll();
    location.reload();
  }
};

window.addEventListener('DOMContentLoaded', () => { UI.init(); });
