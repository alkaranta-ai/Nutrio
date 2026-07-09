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
      alert('Por favor completes todos los casilleros.');
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
      alert('Selecciona un objetivo para tus platos.');
      return;
    }
    this.next();
  },

  finish() {
    let tmb = 10 * this.data.weight + 6.25 * this.data.height - 5 * this.data.age;
    tmb = this.data.sex === 'masculino' ? tmb + 5 : tmb - 161;
    let targetKcal = Math.round(tmb * 1.3);

    if (this.data.goals[0] === 'bajar_peso') targetKcal -= 350;
    if (this.data.goals[0] === 'subir_peso') targetKcal += 350;

    this.data.targetKcal = targetKcal;

    StorageApp.saveProfile(this.data);
    UI.init();
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
    this.renderRecipes();
    this.renderCart();
    this.renderProfile();
    this.goto('inicio');
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

    // Activar botón del dock por orden de aparición
    const views = ['inicio', 'recetas', 'chat', 'carrito', 'perfil'];
    const idx = views.indexOf(viewName);
    const buttons = document.querySelectorAll('.dock-item');
    if (buttons[idx]) buttons[idx].classList.add('active');

    // Mostrar barra de chat solo en la pestaña de chat
    document.getElementById('chatInputBar').style.display = viewName === 'chat' ? 'block' : 'none';
  },

  renderHome() {
    const profile = StorageApp.getProfile();
    document.getElementById('homeGreeting').innerText = `Hola, ${profile.name}!`;
    document.getElementById('kcalTargetText').innerText = `${profile.targetKcal} kcal / día`;
  },

  renderRecipes() {
    const container = document.getElementById('recipeList');
    if (!container) return;
    container.innerHTML = RECIPES_DB.map(r => `
      <div class="recipe-card">
        <h3 style="margin-bottom:4px;">${r.name}</h3>
        <p style="color:var(--primary); font-weight:600; font-size:14px; margin-bottom:8px;">${r.kcal} kcal — ${r.category}</p>
        <p style="font-size:13px; margin-bottom:10px;"><b>Ingredientes:</b> ${r.ingredients.join(', ')}</p>
        <button class="btn btn-glass" style="padding:6px 12px; font-size:13px;" onclick="UI.addIngredientsToCart('${r.id}')">Agregar al carrito</button>
      </div>
    `).join('');
  },

  addIngredientsToCart(id) {
    const recipe = RECIPES_DB.find(r => r.id === id);
    if (!recipe) return;
    let cart = StorageApp.getCart();
    recipe.ingredients.forEach(ing => {
      if (!cart.includes(ing)) cart.push(ing);
    });
    StorageApp.saveCart(cart);
    this.renderCart();
    alert('Ingredientes guardados en tu carrito.');
  },

  renderCart() {
    const cart = StorageApp.getCart();
    const container = document.getElementById('cartCard');
    if (!container) return;
    container.innerHTML = cart.length === 0
      ? `<p class="muted" style="text-align:center;">Tu carrito está vacío.</p>`
      : cart.map((item, idx) => `
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px;">
            <span>• ${item}</span>
            <span style="color:red; cursor:pointer;" onclick="UI.removeCart(${idx})">Eliminar</span>
          </div>
        `).join('');
  },

  removeCart(idx) {
    let cart = StorageApp.getCart();
    cart.splice(idx, 1);
    StorageApp.saveCart(cart);
    this.renderCart();
  },

  renderProfile() {
    const profile = StorageApp.getProfile();
    document.getElementById('profileNameDisplay').innerText = profile.name;
    document.getElementById('profileMetaDisplay').innerText = `Meta diaria: ${profile.targetKcal} calorías.`;
  },

  sendChat() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();
    
    const scroll = document.getElementById('chatScroll');
    scroll.innerHTML += `<div style="text-align:right;"><span style="background:var(--primary-dim); color:var(--primary); padding:8px 12px; border-radius:12px; display:inline-block;">${msg}</span></div>`;
    
    input.value = '';
    
    setTimeout(() => {
      const response = ChatApp.getBotResponse(msg);
      scroll.innerHTML += `<div style="text-align:left;"><span style="background:var(--bg); padding:8px 12px; border-radius:12px; display:inline-block;">${response}</span></div>`;
      scroll.scrollTop = scroll.scrollHeight;
    }, 400);
  },

  resetAll() {
    StorageApp.clearAll();
    location.reload();
  }
};

window.addEventListener('DOMContentLoaded', () => { UI.init(); });
