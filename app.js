// CONTROL DEL ONBOARDING (Cuestionario Inicial)
const Onboarding = {
  currentStep: 0,
  data: { goals: [], restrictions: [], meals: 4 },

  next() {
    const steps = document.querySelectorAll('.onb-step');
    steps[this.currentStep].classList.remove('active');
    this.currentStep++;
    steps[this.currentStep].classList.add('active');
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
      alert('Por favor, completa todos tus datos básicos.');
      return;
    }
    this.data.name = name;
    this.data.age = parseInt(age);
    this.data.weight = parseFloat(weight);
    this.data.height = parseFloat(height);
    this.data.sex = document.getElementById('fSex').value;
    this.next();
  },

  validateStep3() {
    if (this.data.goals.length === 0) {
      alert('Por favor, selecciona al menos un objetivo.');
      return;
    }
    this.next();
  },

  finish() {
    this.data.country = document.getElementById('fCountry').value;
    this.data.activity = document.getElementById('fActivity').value;
    
    // Calcular requerimientos diarios estimados (Harris-Benedict simplificado)
    let tmb = 10 * this.data.weight + 6.25 * this.data.height - 5 * this.data.age;
    tmb = this.data.sex === 'masculino' ? tmb + 5 : tmb - 161;
    
    let factor = 1.2;
    if (this.data.activity === 'ligero') factor = 1.375;
    if (this.data.activity === 'moderado') factor = 1.55;
    if (this.data.activity === 'activo') factor = 1.725;
    
    let targetKcal = Math.round(tmb * factor);
    const primaryGoal = this.data.goals[0];
    if (primaryGoal === 'bajar_peso') targetKcal -= 400;
    if (primaryGoal === 'subir_peso' || primaryGoal === 'ganar_musculo') targetKcal += 400;

    this.data.targetKcal = targetKcal;
    this.data.proteinTarget = Math.round(this.data.weight * 1.8);
    this.data.fatTarget = Math.round(this.data.weight * 1);
    this.data.carbsTarget = Math.round((targetKcal - (this.data.proteinTarget * 4 + this.data.fatTarget * 9)) / 4);

    StorageApp.saveProfile(this.data);
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    
    UI.init();
  }
};

// INTERFAZ DE USUARIO (Manejo de Vistas y Renderizado)
const UI = {
  currentView: 'inicio',

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
    
    this.setupDock();
    this.renderHome();
    this.renderRecipes();
    this.renderCart();
    this.renderProfile();
    this.goto('inicio');
  },

  bindChips() {
    document.querySelectorAll('.chip-group').forEach(group => {
      group.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        const val = chip.dataset.val;
        
        if (group.id === 'goalChips' || group.id === 'mealsChips') {
          group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          if (group.id === 'goalChips') Onboarding.data.goals = [val];
          if (group.id === 'mealsChips') Onboarding.data.meals = parseInt(val);
        } else {
          chip.classList.toggle('active');
          if (chip.classList.contains('active')) {
            Onboarding.data.restrictions.push(val);
          } else {
            Onboarding.data.restrictions = Onboarding.data.restrictions.filter(r => r !== val);
          }
        }
      });
    });
  },

  setupDock() {
    document.querySelectorAll('.dock-item').forEach(btn => {
      btn.onclick = () => {
        const viewName = btn.dataset.view;
        this.goto(viewName);
      };
    });
  },

  goto(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.dock-item').forEach(b => b.classList.remove('active'));
    
    const targetView = document.getElementById(`view-${viewName}`);
    const targetBtn = document.querySelector(`[data-view="${viewName}"]`);
    
    if (targetView) targetView.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');

    const chatBar = document.getElementById('chatInputBar');
    if (chatBar) {
      chatBar.style.display = viewName === 'chat' ? 'block' : 'none';
    }
  },

  renderHome() {
    const profile = StorageApp.getProfile();
    const log = StorageApp.getLog();
    
    document.getElementById('homeGreeting').innerText = `Hola, ${profile.name}!`;
    document.getElementById('homeDate').innerText = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
    
    document.getElementById('ringKcalText').innerText = log.kcal;
    document.getElementById('macroProtein').innerText = `${log.protein} / ${profile.proteinTarget}g`;
    document.getElementById('macroCarbs').innerText = `${log.carbs} / ${profile.carbsTarget}g`;
    document.getElementById('macroFat').innerText = `${log.fat} / ${profile.fatTarget}g`;

    // Ring SVG calculation
    const ring = document.getElementById('ringKcal');
    if (ring) {
      const pct = Math.min(log.kcal / profile.targetKcal, 1);
      const strokeDash = 364.4 * (1 - pct);
      ring.style.strokeDashoffset = strokeDash;
    }

    // Render slots vacíos o con datos
    const logCard = document.getElementById('todayLogCard');
    logCard.innerHTML = log.items.length === 0 
      ? `<p class="muted" style="text-align:center; padding:10px 0;">No registraste alimentos hoy.</p>`
      : log.items.map(i => `<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>${i.name}</span><b>${i.kcal} kcal</b></div>`).join('');
  },

  openQuickAdd() {
    const name = prompt("¿Qué comiste?");
    const kcal = prompt("¿Cuántas kcal aproximadas?");
    if (name && kcal) {
      const log = StorageApp.getLog();
      log.items.push({ name, kcal: parseInt(kcal) });
      log.kcal += parseInt(kcal);
      StorageApp.saveLog(log);
      this.renderHome();
    }
  },

  renderRecipes() {
    const container = document.getElementById('recipeList');
    if (!container) return;
    container.innerHTML = RECIPES_DB.map(r => `
      <div class="glass" style="margin-bottom:12px; padding:16px;">
        <h3 style="margin:0 0 4px 0;">${r.name}</h3>
        <span class="eyebrow">${r.category} — ${r.kcal} kcal</span>
        <button class="btn btn-glass btn-sm" style="margin-top:10px; padding:8px 12px; font-size:13px;" onclick="UI.addRecipeToCart('${r.id}')">Sumar ingredientes al carrito</button>
      </div>
    `).join('');
  },

  addRecipeToCart(id) {
    const recipe = RECIPES_DB.find(r => r.id === id);
    if (!recipe) return;
    let cart = StorageApp.getCart();
    recipe.ingredients.forEach(ing => {
      if (!cart.includes(ing)) cart.push(ing);
    });
    StorageApp.saveCart(cart);
    this.renderCart();
    alert('¡Ingredientes agregados al carrito!');
  },

  renderCart() {
    const cart = StorageApp.getCart();
    const container = document.getElementById('cartCard');
    const badge = document.getElementById('cartBadge');
    
    if (badge) {
      badge.innerText = cart.length;
      badge.classList.toggle('hidden', cart.length === 0);
    }

    if (!container) return;
    container.innerHTML = cart.length === 0
      ? `<p class="muted" style="text-align:center; padding:10px 0;">Tu lista está vacía.</p>`
      : cart.map((item, idx) => `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span>• ${item}</span>
            <button class="link-btn" style="color:#e08585" onclick="UI.removeCartItem(${idx})">Eliminar</button>
          </div>
        `).join('');
  },

  addCartItem() {
    const input = document.getElementById('cartInput');
    if (!input || !input.value.trim()) return;
    let cart = StorageApp.getCart();
    cart.push(input.value.trim());
    StorageApp.saveCart(cart);
    input.value = '';
    this.renderCart();
  },

  removeCartItem(idx) {
    let cart = StorageApp.getCart();
    cart.splice(idx, 1);
    StorageApp.saveCart(cart);
    this.renderCart();
  },

  renderProfile() {
    const profile = StorageApp.getProfile();
    if (!profile) return;
    document.getElementById('profileName').innerText = profile.name;
    document.getElementById('profileMeta').innerText = `${profile.country} — ${profile.age} años`;
    document.getElementById('statKcal').innerText = profile.targetKcal;
    document.getElementById('statGoal').innerText = profile.goals[0].replace('_', ' ');
    document.getElementById('avatarInitial').innerText = profile.name.charAt(0).toUpperCase();
  },

  sendChat() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();
    
    const scroll = document.getElementById('chatScroll');
    scroll.innerHTML += `<div style="text-align:right; margin-bottom:12px;"><span style="background:var(--primary-dim); color:var(--primary); padding:8px 14px; border-radius:14px 14px 2px 14px; display:inline-block;">${msg}</span></div>`;
    
    input.value = '';
    
    setTimeout(() => {
      const response = ChatApp.getBotResponse(msg);
      scroll.innerHTML += `<div style="text-align:left; margin-bottom:12px;"><span style="background:var(--surface); border:1px solid var(--border); padding:8px 14px; border-radius:14px 14px 14px 2px; display:inline-block;">${response}</span></div>`;
      scroll.scrollTop = scroll.scrollHeight;
    }, 500);
  },

  resetAll() {
    if (confirm('¿Seguro querés borrar todos tus datos de perfil y empezar de cero?')) {
      StorageApp.clearAll();
      location.reload();
    }
  }
};

// DISPARADOR INICIAL AL CARGAR LA PÁGINA
window.addEventListener('DOMContentLoaded', () => {
  UI.init();
});
