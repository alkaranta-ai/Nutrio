// ============================================================
// Persistencia local — usa localStorage, todo vive en el dispositivo
// del usuario. Nada se envía a ningún servidor.
// ============================================================

const DB_KEYS = {
  profile: "nutri.profile",
  log: "nutri.log",          // registro diario de alimentos consumidos
  cart: "nutri.cart",        // carrito de compras
  favorites: "nutri.favs",   // recetas favoritas
  chat: "nutri.chat",        // historial de chat
};

const Store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* almacenamiento lleno o no disponible */ }
  },
  remove(key) {
    localStorage.removeItem(key);
  },

  getProfile() { return this.get(DB_KEYS.profile, null); },
  setProfile(p) { this.set(DB_KEYS.profile, p); },

  todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
  },

  getLog() { return this.get(DB_KEYS.log, {}); },
  getTodayLog() {
    const log = this.getLog();
    return log[this.todayKey()] || [];
  },
  addLogEntry(entry) {
    const log = this.getLog();
    const key = this.todayKey();
    if (!log[key]) log[key] = [];
    log[key].push({ ...entry, time: new Date().toISOString() });
    this.set(DB_KEYS.log, log);
  },
  removeLogEntry(index) {
    const log = this.getLog();
    const key = this.todayKey();
    if (log[key]) {
      log[key].splice(index, 1);
      this.set(DB_KEYS.log, log);
    }
  },

  getCart() { return this.get(DB_KEYS.cart, []); },
  setCart(items) { this.set(DB_KEYS.cart, items); },
  addToCart(name, qty, unit) {
    const cart = this.getCart();
    const existing = cart.find(i => normalize(i.name) === normalize(name));
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ name, qty, unit: unit || "", checked: false });
    }
    this.setCart(cart);
  },
  toggleCartItem(index) {
    const cart = this.getCart();
    if (cart[index]) cart[index].checked = !cart[index].checked;
    this.setCart(cart);
  },
  removeCartItem(index) {
    const cart = this.getCart();
    cart.splice(index, 1);
    this.setCart(cart);
  },
  clearChecked() {
    const cart = this.getCart().filter(i => !i.checked);
    this.setCart(cart);
  },

  getFavorites() { return this.get(DB_KEYS.favorites, []); },
  toggleFavorite(recipeId) {
    let favs = this.getFavorites();
    if (favs.includes(recipeId)) favs = favs.filter(id => id !== recipeId);
    else favs.push(recipeId);
    this.set(DB_KEYS.favorites, favs);
    return favs;
  },

  getChatHistory() { return this.get(DB_KEYS.chat, []); },
  addChatMessage(msg) {
    const hist = this.getChatHistory();
    hist.push(msg);
    this.set(DB_KEYS.chat, hist.slice(-100));
  },
};

// ============================================================
// Cálculos nutricionales — Mifflin-St Jeor para BMR,
// factor de actividad para TDEE, y reparto de macros por objetivo.
// ============================================================

const ACTIVITY_FACTORS = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  activo: 1.725,
  muy_activo: 1.9,
};

function calcBMR(profile) {
  const { weight, height, age, sex } = profile;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === "femenino" ? base - 161 : base + 5;
}

function calcTDEE(profile) {
  const bmr = calcBMR(profile);
  const factor = ACTIVITY_FACTORS[profile.activity] || 1.375;
  return bmr * factor;
}

function calcTargets(profile) {
  let tdee = calcTDEE(profile);
  let goalAdjust = 0;
  if (profile.goal === "bajar_peso") goalAdjust = -0.18;
  if (profile.goal === "subir_peso" || profile.goal === "ganar_musculo") goalAdjust = 0.15;

  const kcalTarget = Math.round(tdee * (1 + goalAdjust));

  // Reparto de macros según objetivo
  let proteinPerKg = 1.6, fatPct = 0.28;
  if (profile.goal === "ganar_musculo") proteinPerKg = 2.0;
  if (profile.goal === "bajar_peso") proteinPerKg = 2.0;

  const protein = Math.round(profile.weight * proteinPerKg);
  const proteinKcal = protein * 4;
  const fatKcal = kcalTarget * fatPct;
  const fat = Math.round(fatKcal / 9);
  const carbsKcal = kcalTarget - proteinKcal - fatKcal;
  const carbs = Math.round(Math.max(carbsKcal, 0) / 4);

  return {
    kcal: kcalTarget,
    protein, carbs, fat,
    water: Math.round(profile.weight * 35), // ml/día aprox.
  };
}

function sumTodayMacros() {
  const entries = Store.getTodayLog();
  return entries.reduce((acc, e) => {
    acc.kcal += e.kcal || 0;
    acc.protein += e.protein || 0;
    acc.carbs += e.carbs || 0;
    acc.fat += e.fat || 0;
    return acc;
  }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}
