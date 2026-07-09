// ============================================================
// App shell — router simple entre las vistas del dock, manejo del
// onboarding, y renderizado de cada sección. Vanilla JS, sin build step.
// ============================================================

const RING_R = 58;
const RING_C = 2 * Math.PI * RING_R;

// ---------------- Onboarding ----------------
const Onboarding = {
  step: 0,
  total: 6, // pasos 0..5
  data: { restrictions: [] },

  init() {
    this.renderDots();
    document.querySelectorAll('#goalChips .chip').forEach(c =>
      c.addEventListener('click', () => this.selectSingle('#goalChips', c, 'goal')));
    document.querySelectorAll('#restrictChips .chip').forEach(c =>
      c.addEventListener('click', () => this.toggleMulti(c, 'restrictions')));
    document.querySelectorAll('#mealsChips .chip').forEach(c =>
      c.addEventListener('click', () => this.selectSingle('#mealsChips', c, 'meals')));
  },

  selectSingle(groupSel, chip, key) {
    document.querySelectorAll(`${groupSel} .chip`).forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    this.data[key] = chip.dataset.val;
  },

  toggleMulti(chip, key) {
    chip.classList.toggle('active');
    const val = chip.dataset.val;
    if (chip.classList.contains('active')) {
      if (!this.data[key].includes(val)) this.data[key].push(val);
    } else {
      this.data[key] = this.data[key].filter(v => v !== val);
    }
  },

  renderDots() {
    const wrap = document.getElementById('onbDots');
    wrap.innerHTML = '';
    for (let i = 0; i < this.total; i++) {
      const dot = document.createElement('span');
      if (i === this.step) dot.classList.add('active');
      wrap.appendChild(dot);
    }
  },

  goToStep(n) {
    document.querySelectorAll('.onb-step').forEach(s => s.classList.remove('active'));
    document.querySelector(`.onb-step[data-step="${n}"]`).classList.add('active');
    this.step = n;
    this.renderDots();
  },

  next() { this.goToStep(Math.min(this.step + 1, this.total - 1)); },
  prev() { this.goToStep(Math.max(this.step - 1, 0)); },

  validateStep1() {
    const name = document.getElementById('fName').value.trim();
    const age = parseInt(document.getElementById('fAge').value);
    const weight = parseFloat(document.getElementById('fWeight').value);
    const height = parseFloat(document.getElementById('fHeight').value);
    if (!name || !age || !weight || !height) {
      alert('Completá todos los campos para continuar.');
      return;
    }
    Object.assign(this.data, {
      name, age, weight, height,
      sex: document.getElementById('fSex').value,
    });
    this.next();
  },

  validateStep3() {
    if (!this.data.goal) { alert('Elegí un objetivo para continuar.'); return; }
    this.next();
  },

  finish() {
    if (!this.data.meals) this.data.meals = "4";
    this.data.country = document.getElementById('fCountry').value;
    this.data.activity = document.getElementById('fActivity').value;
    this.data.createdAt = new Date().toISOString();

    Store.setProfile(this.data);
    document.getElementById('onboarding').style.display = 'none';
    UI.boot();
  },

  editSetup() {
    const p = Store.getProfile();
    if (!p) return;
    document.getElementById('fName').value = p.name || '';
    document.getElementById('fAge').value = p.age || '';
    document.getElementById('fWeight').value = p.weight || '';
    document.getElementById('fHeight').value = p.height || '';
    document.getElementById('fSex').value = p.sex || 'femenino';
    document.getElementById('fCountry').value = p.country || 'México';
    document.getElementById('fActivity').value = p.activity || 'ligero';
    this.data = { ...p, restrictions: p.restrictions || [] };

    document.querySelectorAll('#goalChips .chip').forEach(c => c.classList.toggle('active', c.dataset.val === p.goal));
    document.querySelectorAll('#restrictChips .chip').forEach(c => c.classList.toggle('active', (p.restrictions||[]).includes(c.dataset.val)));
    document.querySelectorAll('#mealsChips .chip').forEach(c => c.classList.toggle('active', c.dataset.val === p.meals));

    document.getElementById('onboarding').style.display = 'block';
    this.goToStep(0);
  },
};

// ---------------- UI / Router ----------------
const UI = {
  currentView: 'inicio',

  boot() {
    const profile = Store.getProfile();
    if (!profile) {
      document.getElementById('onboarding').style.display = 'block';
      Onboarding.init();
      return;
    }
    document.getElementById('onboarding').style.display = 'none';
    this.bindDock();
    this.goto('inicio');
    if (!Store.getChatHistory().length) {
      Store.addChatMessage({ from: 'bot', text: NutriBot.greet(profile) });
    }
  },

  bindDock() {
    document.querySelectorAll('.dock-item').forEach(btn => {
      btn.addEventListener('click', () => this.goto(btn.dataset.view));
    });
  },

  goto(view) {
    this.currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + view).classList.add('active');
    document.querySelectorAll('.dock-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    document.getElementById('chatInputBar').style.display = view === 'chat' ? 'flex' : 'none';

    if (view === 'inicio') this.renderInicio();
    if (view === 'recetas') this.renderRecetas();
    if (view === 'chat') this.renderChat();
    if (view === 'carrito') this.renderCarrito();
    if (view === 'perfil') this.renderPerfil();
    window.scrollTo(0, 0);
  },

  // ---------- INICIO ----------
  renderInicio() {
    const profile = Store.getProfile();
    const targets = calcTargets(profile);
    const today = sumTodayMacros();

    document.getElementById('homeDate').textContent = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('homeGreeting').textContent = `Hola, ${profile.name.split(' ')[0]}`;

    const pct = Math.min(today.kcal / targets.kcal, 1);
    const offset = RING_C * (1 - pct);
    const ring = document.getElementById('ringKcal');
    ring.setAttribute('stroke-dasharray', RING_C);
    ring.setAttribute('stroke-dashoffset', offset);
    document.getElementById('ringKcalText').textContent = today.kcal;

    document.getElementById('macroProtein').textContent = `${today.protein} / ${targets.protein} g`;
    document.getElementById('macroCarbs').textContent = `${today.carbs} / ${targets.carbs} g`;
    document.getElementById('macroFat').textContent = `${today.fat} / ${targets.fat} g`;

    const log = Store.getTodayLog();
    const logCard = document.getElementById('todayLogCard');
    if (!log.length) {
      logCard.innerHTML = `<p class="muted" style="margin:0;">Todavía no registraste nada hoy. Contale al chat qué comiste, o agregalo manualmente.</p>`;
    } else {
      logCard.innerHTML = log.map((e, i) => `
        <div class="list-row">
          <span>${e.name}<small>${e.kcal} kcal · ${e.protein}g prot</small></span>
          <button class="cart-remove" onclick="UI.removeLog(${i})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>`).join('');
    }

    const dayIdx = new Date().getDate() % RECIPES.length;
    const recipe = RECIPES[dayIdx];
    document.getElementById('homeRecipeSlot').innerHTML = this.recipeCardHTML(recipe);

    this.updateCartBadge();
  },

  removeLog(i) {
    Store.removeLogEntry(i);
    this.renderInicio();
  },

  openQuickAdd() {
    const name = prompt('¿Qué alimento querés agregar? (ej: arroz, pollo, banana)');
    if (!name) return;
    const qtyStr = prompt('¿Cuántas porciones de 100 g? (ej: 1, 1.5, 2)', '1');
    const qty = parseFloat((qtyStr || '1').replace(',', '.')) || 1;
    const food = findFood(name);
    if (!food) { alert('No encontré ese alimento en la base de datos.'); return; }
    const factor = qty;
    Store.addLogEntry({
      name: food.name, grams: qty * 100,
      kcal: Math.round(food.kcal * factor), protein: Math.round(food.protein * factor),
      carbs: Math.round(food.carbs * factor), fat: Math.round(food.fat * factor),
    });
    this.renderInicio();
  },

  // ---------- RECETAS ----------
  activeFilter: 'todas',
  renderRecetas() {
    const filters = ['todas', 'desayuno', 'almuerzo', 'cena', 'snack'];
    const wrap = document.getElementById('recipeFilters');
    wrap.innerHTML = filters.map(f => `<div class="chip ${this.activeFilter === f ? 'active' : ''}" data-f="${f}">${f[0].toUpperCase() + f.slice(1)}</div>`).join('');
    wrap.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => {
      this.activeFilter = c.dataset.f;
      this.renderRecetas();
    }));

    const list = this.activeFilter === 'todas' ? RECIPES : RECIPES.filter(r => r.meal === this.activeFilter);
    document.getElementById('recipeList').innerHTML = list.map(r => this.recipeCardHTML(r)).join('');
  },

  recipeCardHTML(recipe) {
    const m = recipeMacros(recipe);
    return `
      <div class="glass recipe-card" onclick="UI.openRecipe('${recipe.id}')">
        <div class="recipe-top">
          <h3 style="margin-bottom:2px;">${recipe.name}</h3>
          <span class="muted">${recipe.region} · ${recipe.time} min</span>
          <div class="recipe-tags">
            <span class="tag">${recipe.meal}</span>
            ${recipe.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
        </div>
        <div class="recipe-macros">
          <span><b>${m.kcal}</b> kcal</span>
          <span><b>${m.protein}g</b> prot</span>
          <span><b>${m.carbs}g</b> carb</span>
          <span><b>${m.fat}g</b> grasa</span>
        </div>
      </div>`;
  },

  openRecipe(id) {
    const recipe = RECIPES.find(r => r.id === id);
    if (!recipe) return;
    const m = recipeMacros(recipe);
    const favs = Store.getFavorites();
    const isFav = favs.includes(id);

    const html = `
      <div class="glass card">
        <div class="section-head" style="margin-top:0;">
          <h2 style="margin:0;">${recipe.name}</h2>
          <button class="link-btn" onclick="UI.toggleFav('${id}')">${isFav ? '★ Favorita' : '☆ Guardar'}</button>
        </div>
        <span class="muted">${recipe.region} · ${recipe.time} min · ${recipe.meal}</span>
        <div class="recipe-macros" style="padding-left:0;border-top:none;margin-top:12px;">
          <span><b>${m.kcal}</b> kcal</span><span><b>${m.protein}g</b> prot</span>
          <span><b>${m.carbs}g</b> carb</span><span><b>${m.fat}g</b> grasa</span>
        </div>
        <div class="divider"></div>
        <h3>Ingredientes</h3>
        ${recipe.ingredients.map(ing => {
          const f = FOODS.find(x => x.id === ing.food);
          return `<div class="list-row"><span>${f.name}</span><span class="muted">${ing.g} g</span></div>`;
        }).join('')}
        <div class="divider"></div>
        <h3>Preparación</h3>
        <ol style="padding-left:18px; color:var(--ink-1); font-size:14.5px; line-height:1.7;">
          ${recipe.steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="UI.addRecipeToCart('${id}')">Añadir ingredientes al carrito</button>
        <button class="btn btn-glass" style="margin-top:10px;" onclick="UI.closeModal()">Cerrar</button>
      </div>`;
    this.showModal(html);
  },

  toggleFav(id) {
    Store.toggleFavorite(id);
    this.openRecipe(id);
  },

  addRecipeToCart(id) {
    const recipe = RECIPES.find(r => r.id === id);
    recipe.ingredients.forEach(ing => {
      const f = FOODS.find(x => x.id === ing.food);
      Store.addToCart(f.name, ing.g, 'g');
    });
    this.closeModal();
    this.updateCartBadge();
    alert('Ingredientes añadidos al carrito.');
  },

  // ---------- CHAT ----------
  renderChat() {
    const scroll = document.getElementById('chatScroll');
    const history = Store.getChatHistory();
    scroll.innerHTML = history.map(m => `<div class="msg ${m.from}">${m.text}</div>`).join('');
    scroll.scrollTop = scroll.scrollHeight;

    const suggestions = ['¿Cuántas calorías tiene el aguacate?', 'Dame una receta alta en proteína', '¿Cómo voy hoy?', 'Comí 2 huevos', '¿Cuánta agua debo tomar?'];
    document.getElementById('chatSuggestions').innerHTML = suggestions.map(s => `<div class="suggestion-chip" onclick="UI.sendChat('${s.replace(/'/g, "\\'")}')">${s}</div>`).join('');

    setTimeout(() => document.getElementById('chatInput').focus(), 200);
  },

  sendChat(text) {
    const input = document.getElementById('chatInput');
    const message = text || input.value.trim();
    if (!message) return;
    input.value = '';

    Store.addChatMessage({ from: 'user', text: message });
    const profile = Store.getProfile();
    const result = NutriBot.reply(message, profile);
    const botText = typeof result === 'string' ? result : result.text;
    Store.addChatMessage({ from: 'bot', text: botText });

    this.renderChat();
    if (this.currentView === 'inicio') this.renderInicio();
  },

  // ---------- CARRITO ----------
  renderCarrito() {
    const cart = Store.getCart();
    const card = document.getElementById('cartCard');
    if (!cart.length) {
      card.innerHTML = `<div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none"><path d="M3 4h2l2.4 12.2A2 2 0 0 0 9.4 18h7.2a2 2 0 0 0 2-1.6L20 8H6" stroke="currentColor" stroke-width="1.5"/></svg>
        <p>Tu carrito está vacío. Añadí ingredientes desde una receta o escribilos abajo.</p>
      </div>`;
      return;
    }
    card.innerHTML = cart.map((item, i) => `
      <div class="cart-item ${item.checked ? 'checked' : ''}">
        <div class="cart-check ${item.checked ? 'checked' : ''}" onclick="UI.toggleCart(${i})">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="#0a1410" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-qty">${item.qty}${item.unit}</span>
        <button class="cart-remove" onclick="UI.removeCart(${i})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>`).join('');
    this.updateCartBadge();
  },

  toggleCart(i) { Store.toggleCartItem(i); this.renderCarrito(); },
  removeCart(i) { Store.removeCartItem(i); this.renderCarrito(); },
  addCartItem() {
    const input = document.getElementById('cartInput');
    const val = input.value.trim();
    if (!val) return;
    Store.addToCart(val, 1, '');
    input.value = '';
    this.renderCarrito();
  },
  updateCartBadge() {
    const pending = Store.getCart().filter(i => !i.checked).length;
    const badge = document.getElementById('cartBadge');
    badge.textContent = pending;
    badge.classList.toggle('hidden', pending === 0);
  },

  // ---------- PERFIL ----------
  renderPerfil() {
    const p = Store.getProfile();
    const targets = calcTargets(p);
    document.getElementById('avatarInitial').textContent = p.name[0].toUpperCase();
    document.getElementById('profileName').textContent = p.name;
    document.getElementById('profileMeta').textContent = `${p.country} · ${p.age} años`;
    document.getElementById('statKcal').textContent = targets.kcal;
    const goalLabels = { bajar_peso: 'Bajar peso', mantener: 'Mantener', subir_peso: 'Subir peso', ganar_musculo: 'Ganar músculo', comer_mejor: 'Comer mejor' };
    document.getElementById('statGoal').textContent = goalLabels[p.goal] || '—';
    document.getElementById('statWater').textContent = (targets.water / 1000).toFixed(1) + ' L';

    document.getElementById('profileDetails').innerHTML = `
      <div class="list-row"><span>Peso</span><span class="muted">${p.weight} kg</span></div>
      <div class="list-row"><span>Altura</span><span class="muted">${p.height} cm</span></div>
      <div class="list-row"><span>Actividad</span><span class="muted">${p.activity}</span></div>
      <div class="list-row"><span>Restricciones</span><span class="muted">${(p.restrictions||[]).join(', ') || 'Ninguna'}</span></div>
      <div class="list-row"><span>Comidas por día</span><span class="muted">${p.meals}</span></div>
    `;
    document.getElementById('favCount').textContent = Store.getFavorites().length;
  },

  editProfile() { Onboarding.editSetup(); },

  resetAll() {
    if (!confirm('Esto borrará tu perfil, historial y carrito de este dispositivo. ¿Continuar?')) return;
    localStorage.clear();
    location.reload();
  },

  // ---------- Modal genérico ----------
  showModal(innerHTML) {
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modalOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(4,7,8,0.7);backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;';
      overlay.addEventListener('click', (e) => { if (e.target === overlay) UI.closeModal(); });
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<div style="max-width:560px;width:100%;max-height:86vh;overflow-y:auto;padding:14px 14px calc(14px + var(--safe-bottom));">${innerHTML}</div>`;
    overlay.style.display = 'flex';
  },
  closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.style.display = 'none';
  },
};

document.addEventListener('DOMContentLoaded', () => {
  Onboarding.init();
  UI.boot();
});

// Registrar Service Worker para poder instalar la app
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
