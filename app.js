// ==========================================================================
// NUTRIO - ARCHIVO PRINCIPAL DE APLICACIÓN (js/app.js)
// ==========================================================================

// ==========================================================================
// Saca la cantidad/unidad de un texto de ingrediente (ej: "200 g de pollo"
// -> "Pollo", "2 huevos" -> "Huevos", "1/2 cebolla" -> "Cebolla"), así la
// lista de supermercado muestra solo el nombre del ingrediente. También
// permite que un mismo ingrediente con distinta cantidad en recetas
// distintas se junte en una sola línea del carrito en vez de duplicarse.
// ==========================================================================
function stripIngredientQuantity(str) {
  let s = (str || '').trim();
  if (!s) return s;

  const UNITS = [
    'kilos?', 'kg', 'gramos?', 'grs?', 'g',
    'mililitros?', 'ml', 'litros?', 'lts?', 'l',
    'tazas?', 'cdas?', 'cucharadas?', 'cdtas?', 'cucharaditas?',
    'unidad(?:es)?', 'dientes?', 'rodajas?', 'fetas?', 'hojas?',
    'rebanadas?', 'filetes?', 'puñados?', 'pizcas?', 'chorros?',
    'latas?', 'paquetes?', 'bolsas?', 'ramas?', 'ramitas?', 'tazitas?'
  ].join('|');

  // Cantidad inicial: entero/decimal, fracción tipo 1/2, o rango "2-3".
  const qtyPattern = `\\d+[.,]?\\d*(?:\\s*\\/\\s*\\d+)?(?:\\s*-\\s*\\d+[.,]?\\d*)?`;

  // Ej: "200 g de pollo" / "2 huevos" / "1/2 cebolla" / "3 dientes de ajo"
  const regex = new RegExp(`^(?:${qtyPattern})\\s*(?:${UNITS})?\\.?\\s*(?:de\\s+)?`, 'i');

  const cleaned = s.replace(regex, '').trim();
  if (!cleaned) return s; // si no quedó nada legible, mejor devolver el original

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

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

  // ========================================================================
  // WIZARD DE PASOS
  // ========================================================================
  currentStep: 1,
  totalSteps: 8,

  stepTitles: {
    1: 'Datos personales',
    2: 'País y actividad',
    3: 'Tu objetivo',
    4: 'Salud',
    5: 'Preferencias',
    6: 'Hábitos y rutina',
    7: 'Gustos',
    8: 'Estilo de chat'
  },

  initWizard() {
    this.currentStep = 1;
    this._renderStep();
  },

  // Valida solo los campos del paso actual. Devuelve true/false y muestra
  // el mensaje de error específico de ese paso si algo falta.
  _validateStep(step) {
    const errorBox = document.getElementById('onbError');
    let message = null;

    if (step === 1) {
      const name = document.getElementById('fName').value.trim();
      const age = document.getElementById('fAge').value;
      const weight = document.getElementById('fWeight').value;
      const height = document.getElementById('fHeight').value;
      const invalidNumbers = Number(age) <= 0 || Number(weight) <= 0 || Number(height) <= 0;
      if (!name || !age || !weight || !height || invalidNumbers) {
        message = 'Completá tu nombre, edad, peso y altura para continuar.';
      }
    } else if (step === 2) {
      if (!this.selected.activity) {
        message = 'Elegí tu nivel de actividad física para continuar.';
      }
    } else if (step === 3) {
      if (!this.selected.goal) {
        message = 'Elegí tu objetivo principal para continuar.';
      }
    }
    // Los pasos 4 a 8 son todos opcionales: salud, alergias, restricciones,
    // hábitos, gustos, apodo y estilo de chat no bloquean el avance.

    if (message) {
      if (errorBox) {
        errorBox.innerText = message;
        errorBox.classList.add('show');
      } else {
        alert(message);
      }
      return false;
    }
    if (errorBox) errorBox.classList.remove('show');
    return true;
  },

  next() {
    if (!this._validateStep(this.currentStep)) return;

    if (this.currentStep >= this.totalSteps) {
      this.finish();
      return;
    }
    this.currentStep += 1;
    this._renderStep();
  },

  back() {
    if (this.currentStep <= 1) return;
    this.currentStep -= 1;
    const errorBox = document.getElementById('onbError');
    if (errorBox) errorBox.classList.remove('show');
    this._renderStep();
  },

  _renderStep() {
    document.querySelectorAll('.onb-step').forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.step, 10) === this.currentStep);
    });

    const fill = document.getElementById('onbProgressFill');
    if (fill) fill.style.width = `${(this.currentStep / this.totalSteps) * 100}%`;

    const label = document.getElementById('onbProgressLabel');
    if (label) label.innerText = `Paso ${this.currentStep} de ${this.totalSteps}`;

    const title = document.getElementById('onbProgressTitle');
    if (title) title.innerText = this.stepTitles[this.currentStep] || '';

    const backBtn = document.getElementById('onbBackBtn');
    if (backBtn) backBtn.style.display = this.currentStep === 1 ? 'none' : 'block';

    const nextBtn = document.getElementById('onbNextBtn');
    if (nextBtn) nextBtn.innerText = this.currentStep === this.totalSteps ? 'Crear mi perfil' : 'Continuar';

    const scroll = document.querySelector('.onb-scroll');
    if (scroll) scroll.scrollTo({ top: 0, behavior: 'smooth' });
  },

  finish() {
    // Los pasos 1, 2 y 3 (los únicos con campos obligatorios) ya se validaron
    // al avanzar. Igual revalidamos acá por si finish() se llama directo.
    if (!this._validateStep(1) || !this._validateStep(2) || !this._validateStep(3)) {
      // Si algo obligatorio quedó sin completar, volvemos al primer paso con problemas.
      for (let s = 1; s <= 3; s++) {
        if (!this._validateStep(s)) {
          this.currentStep = s;
          this._renderStep();
          this._validateStep(s);
          return;
        }
      }
      return;
    }

    const name = document.getElementById('fName').value.trim();
    const age = document.getElementById('fAge').value;
    const weight = document.getElementById('fWeight').value;
    const height = document.getElementById('fHeight').value;
    const sex = document.getElementById('fSex').value;
    const country = document.getElementById('fCountry').value;

    const allergiesRaw = document.getElementById('fAllergies').value.trim();
    const dislikesRaw = document.getElementById('fDislikes').value.trim();
    const favoriteFoodsRaw = document.getElementById('fFavoriteFoods').value.trim();
    const waterGlasses = document.getElementById('fWaterGlasses').value;
    const sleepHours = document.getElementById('fSleepHours').value;
    const nicknameRaw = document.getElementById('fNickname').value.trim();
    const chatCustom = document.getElementById('fChatCustom').value.trim();

    const profile = {
      name,
      // Apodo/como quiere que le hable Nutrio. Si lo deja vacío, usamos el
      // nombre real del paso 1 como valor por defecto (ver también el
      // fallback "profile.nickname || profile.name" donde se usa el saludo).
      nickname: nicknameRaw || name,
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

  // IMPORTANTE: el carrito de supermercado se arma SOLO con ingredientes de
  // recetas que ya pasaron el filtro de perfil (MealEngine.filterRecipesForProfile),
  // así respeta restricciones (vegetariano/vegano/sin gluten/etc.), alergias y
  // condiciones de salud. Antes esto recorría TODO RECIPES_DB sin filtrar,
  // por eso aparecían ingredientes como carne/jamón/salmón con perfil vegetariano.
  //
  // Además, cada ingrediente pasa por stripIngredientQuantity() antes de
  // guardarse, así el carrito muestra solo el nombre del ingrediente (sin
  // "200 g de", "2 unidades de", etc.). Usamos un Map en vez de un Set
  // plano para que, si el mismo ingrediente aparece con distinta cantidad
  // en dos recetas distintas ("200 g de pollo" y "300 g de pollo"), quede
  // una sola línea ("Pollo") en vez de duplicarse en la lista.
  autoGenerateCart() {
    let itemsMap = new Map(); // clave: nombre en minúsculas -> valor mostrado
    const addIngredient = (ing) => {
      const clean = stripIngredientQuantity(ing);
      const key = clean.toLowerCase();
      if (!itemsMap.has(key)) itemsMap.set(key, clean);
    };

    const profile = StorageApp.getProfile();

    if (typeof RECIPES_DB !== 'undefined' && profile && typeof MealEngine !== 'undefined' && MealEngine.filterRecipesForProfile) {
      const categories = ['desayuno', 'almuerzo', 'meriendas', 'cena'];
      categories.forEach(cat => {
        // Unimos el pool de día normal y de día permitido para que el carrito
        // cubra toda la semana, pero SIEMPRE respetando restricciones/alergias/salud
        // (el "día permitido" solo afloja el postre/alcohol, no las restricciones).
        const poolNormal = MealEngine.filterRecipesForProfile(cat, profile, false) || [];
        const poolCheat = MealEngine.filterRecipesForProfile(cat, profile, true) || [];
        [...poolNormal, ...poolCheat].forEach(r => {
          (r.ingredients || []).forEach(addIngredient);
        });
      });
    }

    // Respaldo: si por algún motivo no hay perfil o MealEngine no filtró nada,
    // no dejamos el carrito vacío (aunque en ese caso no está filtrado por perfil).
    if (itemsMap.size === 0 && typeof RECIPES_DB !== 'undefined') {
      RECIPES_DB.forEach(r => {
        if (r.category === 'antojo') return;
        r.ingredients.forEach(addIngredient);
      });
    }

    StorageApp.saveCart(Array.from(itemsMap.values()));
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

// ==========================================================================
// MEALLOG - Registro de lo que el usuario fue comiendo durante el día.
// Se guarda en localStorage con una clave por fecha (es-AR), así el
// registro arranca de cero solo cada día nuevo sin que haga falta limpiarlo
// a mano. Alimenta las respuestas del chat a "qué comí hoy" / "cuánto llevo".
// ==========================================================================
const MealLog = {
  _todayKey() {
    return `nutrio_eaten_${new Date().toLocaleDateString('es-AR')}`;
  },

  // Devuelve el registro de hoy: [{ name, kcal, slot, time }, ...]
  getToday() {
    return JSON.parse(localStorage.getItem(this._todayKey())) || [];
  },

  // Agrega una comida al registro de hoy. kcal es opcional (por ejemplo,
  // cuando el usuario escribe algo libre en el chat y no viene de una receta).
  add({ name, kcal, slot }) {
    const log = this.getToday();
    log.push({
      name: name || 'Comida sin nombre',
      kcal: typeof kcal === 'number' ? kcal : null,
      slot: slot || null,
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem(this._todayKey(), JSON.stringify(log));
    return log;
  },

  // Suma solo las entradas que tienen kcal conocida (las de texto libre sin
  // receta asociada no cuentan, porque no tenemos forma de saber cuánto valen).
  totalKcalToday() {
    return this.getToday().reduce((sum, e) => sum + (e.kcal || 0), 0);
  },

  clearToday() {
    localStorage.removeItem(this._todayKey());
  }
};

// ==========================================================================
// STREAK - Racha de días seguidos usando la app (estilo Duolingo).
// Se guarda en localStorage la fecha del último "check-in" y el contador.
// Si el usuario entra hoy y ya había entrado ayer, suma un día. Si entra
// el mismo día de nuevo, no cambia nada. Si dejó pasar 2+ días, la racha
// se corta y arranca de nuevo en 1.
// ==========================================================================
const Streak = {
  _KEY: 'nutrio_streak',

  _todayStr() {
    return new Date().toLocaleDateString('es-AR');
  },

  // es-AR: DD/MM/YYYY
  _parseDate(str) {
    const [d, m, y] = str.split('/').map(Number);
    return new Date(y, m - 1, d);
  },

  _load() {
    return JSON.parse(localStorage.getItem(this._KEY)) || { count: 0, longest: 0, lastDate: null };
  },

  _save(data) {
    localStorage.setItem(this._KEY, JSON.stringify(data));
  },

  // Se llama una vez por sesión, al iniciar la app con perfil ya creado.
  // Devuelve { count, longest, isNewDay, brokeStreak } para que la UI pueda
  // reaccionar (por ejemplo, mostrar un mensaje solo si es un día nuevo).
  checkIn() {
    const data = this._load();
    const today = this._todayStr();

    if (data.lastDate === today) {
      return { count: data.count, longest: data.longest, isNewDay: false, brokeStreak: false };
    }

    let brokeStreak = false;
    if (!data.lastDate) {
      data.count = 1;
    } else {
      const last = this._parseDate(data.lastDate);
      const diffDays = Math.round((this._parseDate(today) - last) / 86400000);
      if (diffDays === 1) {
        data.count += 1;
      } else {
        brokeStreak = data.count > 1;
        data.count = 1;
      }
    }

    data.longest = Math.max(data.longest || 0, data.count);
    data.lastDate = today;
    this._save(data);

    return { count: data.count, longest: data.longest, isNewDay: true, brokeStreak };
  },

  getCount() {
    return this._load().count || 0;
  },

  getLongest() {
    return this._load().longest || 0;
  }
};

// ==========================================================================
// ACHIEVEMENTS - Logros/insignias desbloqueables. Se basan en datos que ya
// existen en la app (racha, recetas probadas, días registrando comidas), así
// que no hace falta ningún servidor: todo vive en localStorage.
// ==========================================================================
const Achievements = {
  _KEY_UNLOCKED: 'nutrio_achievements',
  _KEY_RECIPES: 'nutrio_recipes_tried',
  _KEY_LOGDAYS: 'nutrio_log_streak', // { count, lastDate } - días seguidos con al menos 1 comida registrada
  _KEY_PURCHASES: 'nutrio_purchases_saved_count',

  DEFS: [
    { id: 'primer_registro', name: 'Primer paso', icon: '🥇', desc: 'Registraste tu primera comida.', check: (s) => s.recipesTriedOrLogged >= 1 },
    { id: 'racha_7', name: 'Una semana firme', icon: '🔥', desc: '7 días seguidos usando NutrIO.', check: (s) => s.streak >= 7 },
    { id: 'racha_30', name: 'Mes de hierro', icon: '💪', desc: '30 días seguidos usando NutrIO.', check: (s) => s.streak >= 30 },
    { id: 'recetas_10', name: 'Explorador culinario', icon: '🍳', desc: 'Probaste 10 recetas distintas.', check: (s) => s.recipesTried >= 10 },
    { id: 'recetas_20', name: 'Chef en formación', icon: '👨‍🍳', desc: 'Probaste 20 recetas distintas.', check: (s) => s.recipesTried >= 20 },
    { id: 'recetas_50', name: 'Maestro de la cocina', icon: '⭐', desc: 'Probaste 50 recetas distintas.', check: (s) => s.recipesTried >= 50 },
    { id: 'registro_7', name: 'Constancia total', icon: '📅', desc: '7 días seguidos registrando tus comidas.', check: (s) => s.logStreak >= 7 },
    { id: 'compra_guardada', name: 'Carrito prolijo', icon: '🛒', desc: 'Guardaste tu primera compra del carrito.', check: (s) => s.purchasesSaved >= 1 }
  ],

  _load(key) {
    return JSON.parse(localStorage.getItem(key));
  },

  _getUnlocked() {
    return this._load(this._KEY_UNLOCKED) || [];
  },

  _getRecipesTried() {
    return this._load(this._KEY_RECIPES) || [];
  },

  // Llamar cuando el usuario marca "Ya lo comí" en una receta, o registra
  // algo por texto libre en el chat. Le pasamos un identificador estable
  // (recipe.id si existe, o el nombre/texto como respaldo).
  trackRecipeTried(recipeIdentifier) {
    if (!recipeIdentifier) return;
    const tried = this._getRecipesTried();
    if (!tried.includes(recipeIdentifier)) {
      tried.push(recipeIdentifier);
      localStorage.setItem(this._KEY_RECIPES, JSON.stringify(tried));
    }
    this._updateLogStreak();
  },

  // Registra un día más de "constancia" (comida registrada) cada vez que se
  // anota algo, con la misma lógica día-a-día que usa Streak.
  _updateLogStreak() {
    const data = this._load(this._KEY_LOGDAYS) || { count: 0, lastDate: null };
    const today = new Date().toLocaleDateString('es-AR');
    if (data.lastDate === today) return; // ya contamos hoy

    if (!data.lastDate) {
      data.count = 1;
    } else {
      const [d1, m1, y1] = data.lastDate.split('/').map(Number);
      const last = new Date(y1, m1 - 1, d1);
      const [d2, m2, y2] = today.split('/').map(Number);
      const now = new Date(y2, m2 - 1, d2);
      const diffDays = Math.round((now - last) / 86400000);
      data.count = diffDays === 1 ? data.count + 1 : 1;
    }
    data.lastDate = today;
    localStorage.setItem(this._KEY_LOGDAYS, JSON.stringify(data));
  },

  trackPurchaseSaved() {
    const count = (this._load(this._KEY_PURCHASES) || 0) + 1;
    localStorage.setItem(this._KEY_PURCHASES, JSON.stringify(count));
  },

  _getStats() {
    const recipesTried = this._getRecipesTried().length;
    const logStreak = (this._load(this._KEY_LOGDAYS) || {}).count || 0;
    const loggedToday = (typeof MealLog !== 'undefined') ? MealLog.getToday().length > 0 : false;
    return {
      streak: Streak.getCount(),
      recipesTried,
      recipesTriedOrLogged: Math.max(recipesTried, loggedToday ? 1 : 0),
      logStreak,
      purchasesSaved: this._load(this._KEY_PURCHASES) || 0
    };
  },

  // Revisa todas las definiciones y desbloquea las que correspondan.
  // Devuelve un array con los logros NUEVOS desbloqueados en esta llamada.
  checkAndUnlock() {
    const stats = this._getStats();
    const unlocked = this._getUnlocked();
    const unlockedIds = unlocked.map(u => u.id);
    const newlyUnlocked = [];

    this.DEFS.forEach(def => {
      if (unlockedIds.includes(def.id)) return;
      if (def.check(stats)) {
        unlocked.push({ id: def.id, date: new Date().toLocaleDateString('es-AR') });
        newlyUnlocked.push(def);
      }
    });

    if (newlyUnlocked.length) {
      localStorage.setItem(this._KEY_UNLOCKED, JSON.stringify(unlocked));
    }
    return newlyUnlocked;
  },

  // Devuelve TODAS las definiciones con un flag "unlocked", para pintar la
  // grilla completa de logros en el Perfil (los bloqueados se ven en gris/🔒).
  getAllWithStatus() {
    const unlockedIds = this._getUnlocked().map(u => u.id);
    return this.DEFS.map(def => ({ ...def, unlocked: unlockedIds.includes(def.id) }));
  }
};

// ==========================================================================
// NOTIFICATIONS - Recordatorios tipo "¿ya almorzaste?" en cada franja horaria.
//
// LIMITACIÓN IMPORTANTE: esto usa la Notification API del navegador desde
// la propia página. Funciona mientras la pestaña/app está abierta (o, en
// Android con la app instalada como PWA, con la pantalla apagada por un
// rato). NO es un push real: para que llegue una notificación con el
// celular bloqueado y la app totalmente cerrada varios días, hace falta un
// service worker + un servidor de push (Web Push/VAPID) del lado del
// backend, que esta app no tiene (es 100% local, sin servidor). Si más
// adelante suman un backend, esto se puede migrar a Web Push real.
// ==========================================================================
const Notifications = {
  _KEY_ENABLED: 'nutrio_notif_enabled',
  _CHECK_INTERVAL_MS: 60 * 1000,
  _intervalId: null,

  // Franja + hora en que se dispara el recordatorio si todavía no se
  // registró nada para esa comida (reusa las franjas de ChatApp._getMealSlot).
  _SCHEDULE: [
    { slot: 'desayuno', label: 'el desayuno', hour: 8, minute: 30 },
    { slot: 'almuerzo', label: 'el almuerzo', hour: 13, minute: 0 },
    { slot: 'merienda', label: 'la merienda', hour: 17, minute: 30 },
    { slot: 'cena', label: 'la cena', hour: 21, minute: 0 }
  ],

  _supported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  isEnabled() {
    return JSON.parse(localStorage.getItem(this._KEY_ENABLED) || 'false');
  },

  async requestPermission() {
    if (!this._supported()) {
      alert('Tu navegador no soporta notificaciones. Probá desde Chrome en Android o Desktop.');
      return false;
    }
    const perm = await Notification.requestPermission();
    const enabled = perm === 'granted';
    localStorage.setItem(this._KEY_ENABLED, JSON.stringify(enabled));
    if (enabled) this.start();
    return enabled;
  },

  // Prende/apaga los recordatorios. Si hay que pedir permiso, lo pide.
  async toggle() {
    if (this.isEnabled()) {
      localStorage.setItem(this._KEY_ENABLED, JSON.stringify(false));
      this.stop();
      return false;
    }
    return await this.requestPermission();
  },

  start() {
    if (!this._supported() || Notification.permission !== 'granted') return;
    if (this._intervalId) return;
    this._intervalId = setInterval(() => this._checkSchedule(), this._CHECK_INTERVAL_MS);
    this._checkSchedule();
  },

  stop() {
    if (this._intervalId) clearInterval(this._intervalId);
    this._intervalId = null;
  },

  _todayNotifiedKey() {
    return `nutrio_notified_${new Date().toLocaleDateString('es-AR')}`;
  },

  _alreadyNotified(slot) {
    const list = JSON.parse(localStorage.getItem(this._todayNotifiedKey())) || [];
    return list.includes(slot);
  },

  _markNotified(slot) {
    const list = JSON.parse(localStorage.getItem(this._todayNotifiedKey())) || [];
    if (!list.includes(slot)) list.push(slot);
    localStorage.setItem(this._todayNotifiedKey(), JSON.stringify(list));
  },

  _checkSchedule() {
    if (!this.isEnabled() || Notification.permission !== 'granted') return;
    const now = new Date();
    const loggedToday = (typeof MealLog !== 'undefined') ? MealLog.getToday() : [];

    this._SCHEDULE.forEach(({ slot, label, hour, minute }) => {
      const target = new Date();
      target.setHours(hour, minute, 0, 0);
      const graceEnd = new Date(target.getTime() + 90 * 60 * 1000); // ventana de 90 min

      if (now < target || now > graceEnd) return;
      if (this._alreadyNotified(slot)) return;

      const yaRegistroEsaFranja = loggedToday.some(e => e.slot === slot);
      if (yaRegistroEsaFranja) {
        this._markNotified(slot);
        return;
      }

      this._fire(`Che, ¿ya está ${label}? 🍽️`, 'No te olvides de anotarlo en NutrIO cuando comas, así seguimos tu racha 🔥');
      this._markNotified(slot);
    });
  },

  _fire(title, body) {
    try {
      new Notification(title, { body });
    } catch (e) {
      // Algunos navegadores mobile no soportan "new Notification()" directo
      // y piden pasar por un Service Worker; si eso falla, no rompemos la app.
    }
  }
};

// ==========================================================================
// SPEECH - Text-to-speech con la Web Speech API del navegador (nativa,
// sin costo ni servicios externos). Lee en voz alta las respuestas del bot.
// El estado "enabled" (auto-hablar) y la voz elegida se persisten en localStorage.
// ==========================================================================
const Speech = {
  enabled: JSON.parse(localStorage.getItem('nutrio_speech_enabled') || 'false'),

  // ------------------------------------------------------------------
  // IDENTIDAD DE VOZ DE NUTRIO: rate y pitch fijos que definen su
  // personalidad (un poco más rápido y agudo que el default 1/1, así
  // suena vivo, joven y con onda en vez de la voz robot plana). Estos
  // valores son la "firma" de NutrIO: se aplican siempre, sin importar
  // qué voz del dispositivo termine hablando.
  // ------------------------------------------------------------------
  _rate: 1.08,
  _pitch: 1.15,

  // Lista de voces conocidas que suelen sonar mejor (más cálidas/claras)
  // en cada plataforma, en orden de preferencia. Se prueban ANTES que el
  // puntaje genérico de _pickVoice, así NutrIO tiende a sonar siempre
  // con la misma "cara" reconocible en vez de una voz distinta por azar
  // en cada dispositivo. Son nombres reales que exponen los navegadores:
  // Android/Chrome expone voces "Google", iOS/macOS expone voces con
  // nombre propio (Mónica, Paulina, Helena), Windows expone "Microsoft X".
  _PREFERRED_VOICE_NAMES: [
    'google español de estados unidos',
    'google español',
    'mónica', 'monica',       // iOS/macOS, español de España, cálida
    'paulina',                 // iOS/macOS, español latino
    'helena',                  // iOS/macOS/Windows, español neutro
    'microsoft sabina',        // Windows
    'microsoft helena',        // Windows
    'microsoft dalia'          // Windows, español latino
  ],

  _supported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  // Lista todas las voces en español disponibles en este dispositivo/navegador,
  // usada por el selector de voz (si se reactiva en el futuro).
  getSpanishVoices() {
    if (!this._supported()) return [];
    return window.speechSynthesis.getVoices()
      .filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
  },

  // Guarda (o borra, si name es null) la voz elegida a mano por el usuario.
  setVoice(name) {
    if (name) localStorage.setItem('nutrio_speech_voice_name', name);
    else localStorage.removeItem('nutrio_speech_voice_name');
  },

  // 1) Si el usuario ya eligió una voz a mano (con el selector 🎙️), se usa esa.
  // 2) Si no, se puntúa cada voz en español disponible y se elige la mejor:
  //    prioriza es-AR, voces con nombres que suelen ser de mejor calidad
  //    (Google/Natural/Neural/Enhanced/Premium) y voces "de red" (no locales
  //    del sistema operativo), que en general suenan menos robóticas que las
  //    voces locales tipo "espeak".
  // Las voces a veces cargan de forma asíncrona (sobre todo en iOS/Chrome),
  // por eso no cacheamos el resultado como definitivo la primera vez.
  _pickVoice() {
    if (!this._supported()) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const savedName = localStorage.getItem('nutrio_speech_voice_name');
    if (savedName) {
      const saved = voices.find(v => v.name === savedName);
      if (saved) return saved;
    }

    const spanish = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('es'));
    if (!spanish.length) return null;

    // PASO 1: intentamos matchear por nombre contra la lista de voces
    // conocidas/preferidas (la "identidad" de NutrIO en cada plataforma),
    // en el orden de esa lista. Apenas encontramos la primera coincidencia
    // disponible en este dispositivo, la usamos directo sin pasar por el
    // puntaje genérico de abajo.
    for (const preferredName of this._PREFERRED_VOICE_NAMES) {
      const match = spanish.find(v => v.name.toLowerCase().includes(preferredName));
      if (match) return match;
    }

    // PASO 2 (respaldo): si ninguna de las preferidas está disponible en
    // este dispositivo, usamos el puntaje genérico de siempre para elegir
    // la mejor opción posible entre lo que sí hay instalado.
    const score = (v) => {
      let s = 0;
      if (v.lang === 'es-AR') s += 5;
      else if (['es-419', 'es-mx', 'es-us'].includes(v.lang.toLowerCase())) s += 3;
      else s += 1;

      const name = v.name.toLowerCase();
      if (name.includes('google')) s += 4;
      if (name.includes('natural') || name.includes('neural')) s += 4;
      if (name.includes('enhanced') || name.includes('premium') || name.includes('plus')) s += 3;
      if (name.includes('multilingual')) s += 1;
      if (!v.localService) s += 2; // las voces de red suelen sonar mejor que las locales del SO

      return s;
    };

    return [...spanish].sort((a, b) => score(b) - score(a))[0];
  },

  // Saca negritas en markdown (**texto**), tags HTML sueltos y emojis, así
  // la voz no lee "asterisco asterisco" ni símbolos raros.
  _clean(text) {
    return (text || '')
      .replace(/\*\*/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  },

  speak(text, overrides) {
    if (!this._supported() || !text) return;
    window.speechSynthesis.cancel(); // corta cualquier lectura anterior en curso
    const clean = this._clean(text);
    if (!clean) return;
    const utter = new SpeechSynthesisUtterance(clean);
    const voice = this._pickVoice();
    if (voice) utter.voice = voice;
    utter.lang = voice ? voice.lang : 'es-AR';
    utter.rate = (overrides && overrides.rate) || this._rate;
    utter.pitch = (overrides && overrides.pitch) || this._pitch;
    window.speechSynthesis.speak(utter);
  },

  stop() {
    if (this._supported()) window.speechSynthesis.cancel();
  },

  // Prende/apaga el auto-hablar (que Nutrio lea cada respuesta sola, sin
  // tener que tocar el botón de parlante en cada mensaje).
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('nutrio_speech_enabled', JSON.stringify(this.enabled));
    if (!this.enabled) this.stop();
    return this.enabled;
  }
};

// Algunos navegadores (Chrome, iOS Safari) cargan la lista de voces de forma
// asíncrona después de la primera interacción; no hace falta hacer nada acá,
// pero registramos el evento para que _pickVoice() encuentre voces ni bien
// estén listas en vez de fallar en el primer intento.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { /* noop: getVoices() ya las trae frescas cuando se llama */ };
}

// ==========================================================================
// VOICEINPUT - Reconocimiento de voz (Speech-to-Text) con la Web Speech API
// nativa del navegador (sin costo ni servicios externos). Transcribe lo que
// decís, lo muestra en tiempo real en el input del chat y, apenas detecta
// que terminaste de hablar (resultado final), MANDA EL MENSAJE SOLO — no
// hace falta tocar el botón de enviar. En Chrome/Android funciona bárbaro;
// en iOS Safari el soporte es más limitado (a veces no está disponible).
// ==========================================================================
const VoiceInput = {
  _recognition: null,
  _listening: false,
  _finalTranscript: '',
  // Guarda el último texto PARCIAL (interim) además del final. Hace falta
  // porque en iOS Safari el evento isFinal casi nunca se dispara: la única
  // señal de que terminaste de hablar es "onend" (corta por silencio), sin
  // haber confirmado nunca un resultado final. Sin este respaldo, en iOS
  // el texto queda escrito en el input pero nunca se manda solo.
  _interimTranscript: '',
  _autoSent: false,   // evita mandar dos veces si onresult y onend se solapan
  _cancelled: false,  // true solo cuando el usuario cancela tocando el mic de nuevo

  _supported() {
    return typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  _ensureRecognition() {
    if (this._recognition) return this._recognition;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const rec = new SR();
    rec.lang = 'es-AR';
    rec.continuous = false;       // corta sola cuando dejás de hablar
    rec.interimResults = true;    // vas viendo el texto mientras hablás
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let interim = '';
      let gotFinal = false;

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          this._finalTranscript += transcript;
          gotFinal = true;
        } else {
          interim += transcript;
        }
      }
      this._interimTranscript = interim;

      // Mientras hay resultado parcial, solo actualizamos el input para que
      // el usuario vea lo que va diciendo (sin mandar nada todavía).
      this._updateInput(this._finalTranscript + interim);

      // Camino normal (Android/Chrome): apenas llega el resultado FINAL de
      // una frase, se manda solo sin esperar a que cierre el reconocimiento.
      if (gotFinal && this._finalTranscript.trim() && !this._autoSent) {
        this._autoSent = true;
        rec.stop();
        this._sendTranscribed(this._finalTranscript);
      }
    };

    rec.onerror = (e) => {
      this._listening = false;
      this._updateButtonState();
      let msg = null;
      if (e.error === 'not-allowed' || e.error === 'permission-denied') {
        msg = 'Necesito permiso para usar el micrófono. Habilitalo en la configuración del navegador y probá de nuevo.';
      } else if (e.error === 'no-speech') {
        msg = null; // no hace falta molestar con esto, simplemente no capturó nada
      } else if (e.error === 'network') {
        msg = 'Se cortó la conexión mientras escuchaba. Probá de nuevo.';
      }
      if (msg) this._notify(msg);
    };

    rec.onend = () => {
      this._listening = false;
      this._updateButtonState();

      // FALLBACK PARA iOS SAFARI: ahí el resultado "final" prácticamente
      // nunca llega (isFinal se queda en false todo el tiempo); lo único
      // que sí dispara siempre es "onend" cuando detecta que dejaste de
      // hablar. Si llegamos acá sin haber mandado nada todavía y no fue
      // una cancelación explícita (tocar el mic de nuevo a propósito),
      // mandamos lo que se llegó a transcribir: el final si lo hay, o
      // si no, el último texto parcial capturado.
      if (!this._autoSent && !this._cancelled) {
        const text = (this._finalTranscript || this._interimTranscript || '').trim();
        if (text) {
          this._autoSent = true;
          this._sendTranscribed(text);
          this._cancelled = false;
          return;
        }
      }

      if (!this._autoSent) {
        const input = document.getElementById('chatInput');
        if (input) input.focus();
      }
      this._cancelled = false;
    };

    this._recognition = rec;
    return rec;
  },

  _updateInput(text) {
    const input = document.getElementById('chatInput');
    if (!input) return;
    input.value = text;
    // Dispara el auto-grow que ya tenés bindeado en _bindChatInputAutoGrow
    input.dispatchEvent(new Event('input'));
  },

  // Envía lo transcripto usando el flujo normal de chat (UI.sendChat), así
  // el mensaje del usuario pasa por exactamente el mismo camino que si lo
  // hubiera escrito y tocado "enviar" a mano. Recibe el texto explícito
  // (final o, en su defecto, el último parcial) en vez de asumir siempre
  // this._finalTranscript, porque en iOS puede venir vacío.
  _sendTranscribed(text) {
    const finalText = (text !== undefined ? text : this._finalTranscript).trim();
    if (!finalText) return;

    const input = document.getElementById('chatInput');
    if (input) {
      input.value = finalText;
      input.dispatchEvent(new Event('input'));
    }
    // Pequeño delay para que se vea el texto transcripto un instante antes
    // de que se dispare el envío (mejor feedback visual para el usuario).
    setTimeout(() => {
      UI.sendChat();
      this._finalTranscript = '';
      this._interimTranscript = '';
    }, 250);
  },

  _updateButtonState() {
    const btn = document.getElementById('voiceInputBtn');
    if (!btn) return;
    btn.innerText = this._listening ? '🔴' : '🎤';
    btn.classList.toggle('listening', this._listening);
    btn.title = this._listening ? 'Escuchando... tocá para cancelar' : 'Hablarle a NutrIO';
  },

  _notify(text) {
    const scroll = document.getElementById('chatScroll');
    if (!scroll) { alert(text); return; }
    const now = new Date();
    scroll.innerHTML += `
      <div class="msg-row bot">
        <div class="msg-wrap">
          <div class="msg-bubble bot">${text}</div>
          <div class="msg-time">${UI._formatTime(now)}</div>
        </div>
      </div>`;
    scroll.scrollTop = scroll.scrollHeight;
  },

  toggle() {
    if (!this._supported()) {
      this._notify('Tu navegador no soporta reconocimiento de voz nativo 😕. Probá desde Chrome en Android, o escribime como siempre.');
      return;
    }

    const rec = this._ensureRecognition();
    if (!rec) return;

    if (this._listening) {
      // Tocar el mic mientras está escuchando CANCELA (no envía nada a medias).
      this._finalTranscript = '';
      this._interimTranscript = '';
      this._autoSent = true;   // evita que onresult dispare un envío tardío
      this._cancelled = true;  // le avisa a onend que esto fue una cancelación, no un fin natural
      rec.stop();
      this._listening = false;
      this._updateButtonState();
      const input = document.getElementById('chatInput');
      if (input) { input.value = ''; input.dispatchEvent(new Event('input')); }
      return;
    }

    this._finalTranscript = '';
    this._interimTranscript = '';
    this._autoSent = false;
    this._cancelled = false;
    const input = document.getElementById('chatInput');
    if (input) { input.value = ''; input.dispatchEvent(new Event('input')); }

    try {
      rec.start();
      this._listening = true;
      this._updateButtonState();
    } catch (err) {
      // rec.start() explota si ya estaba arrancado (doble click rápido, etc.)
      this._listening = false;
      this._updateButtonState();
    }
  }
};

// ==========================================================================
// NUTRIOAVATAR - Carita animada de Nutrio en el header del chat (100% SVG +
// CSS, sin imágenes externas). Versión PREMIUM+ / LIQUID GLASS: burbuja
// vidriada con blur real (backdrop-filter), borde iridiscente animado tipo
// "liquid glass" que gira despacio, reflejos en varias capas con
// profundidad real, ojos con brillito propio (más "vivos"), parpadeo
// asincrónico entre ojo izq/der (no robótico), flote suave permanente y
// puntitos de "escribiendo..." en el estado pensando en vez de una simple
// boca en O. La API pública es idéntica a la versión anterior, así que no
// hace falta tocar nada más del archivo.
//
// Estados:
//  - 'dormido'     : sin actividad hace rato, ojitos cerrados + "z" flotando.
//  - 'despierto'   : hay actividad reciente, ojos abiertos y con brillo,
//                    parpadea de vez en cuando (asincrónico), mejillas
//                    visibles.
//  - 'pensando'    : está esperando la respuesta del bot, ceja levantada,
//                    puntitos animados tipo "escribiendo...".
//  - 'feliz'       : acaba de mandarse o recibirse un mensaje. Pega un
//                    saltito, sonrisa grande, mejillas más brillantes, y
//                    después vuelve a 'despierto'.
//  - 'sorprendido' : reacción grande para logros/racha — ojos y boca bien
//                    abiertos, cejas arriba, chispitas alrededor, con un
//                    "pop" más marcado que el de 'feliz'.
//  - 'guino'       : guiño juguetón con media sonrisa (uso puntual, vía
//                    NutrioAvatar.wink()).
// Si pasan _IDLE_MS sin ninguna interacción, vuelve solo a 'dormido'.
// ==========================================================================
const NutrioAvatar = {
  _state: 'dormido',
  _idleTimer: null,
  _IDLE_MS: 18000, // 18s sin actividad en el chat y se vuelve a dormir
  _el: null,
  _SIZE: 52, // burbuja de vidrio: un pelín más grande para que el blur respire

  _FACES: {
    dormido: `
      <g class="nutrio-face nutrio-face-dormido">
        <path d="M12 18 q3 -3 6 0" class="nutrio-eye-closed" />
        <path d="M26 18 q3 -3 6 0" class="nutrio-eye-closed" />
        <ellipse cx="15" cy="23.5" rx="2.2" ry="1.3" class="nutrio-cheek" />
        <ellipse cx="29" cy="23.5" rx="2.2" ry="1.3" class="nutrio-cheek" />
        <path d="M16 27 q6 2.5 12 0" class="nutrio-mouth" />
        <text x="32" y="10" class="nutrio-zzz nutrio-zzz1">z</text>
        <text x="36" y="6" class="nutrio-zzz nutrio-zzz2">z</text>
      </g>`,
    despierto: `
      <g class="nutrio-face nutrio-face-despierto">
        <g class="nutrio-eye-group nutrio-eye-group-l">
          <circle cx="15" cy="18" r="2.7" class="nutrio-eye" />
          <circle cx="16.1" cy="16.9" r="0.85" class="nutrio-eye-shine" />
        </g>
        <g class="nutrio-eye-group nutrio-eye-group-r">
          <circle cx="29" cy="18" r="2.7" class="nutrio-eye" />
          <circle cx="30.1" cy="16.9" r="0.85" class="nutrio-eye-shine" />
        </g>
        <ellipse cx="15" cy="24.5" rx="2.2" ry="1.3" class="nutrio-cheek" />
        <ellipse cx="29" cy="24.5" rx="2.2" ry="1.3" class="nutrio-cheek" />
        <path d="M16 27 q6 4 12 0" class="nutrio-mouth" />
      </g>`,
    pensando: `
      <g class="nutrio-face nutrio-face-pensando">
        <path d="M10.5 14 q3 -1.8 6 0" class="nutrio-eyebrow" />
        <circle cx="14" cy="17.5" r="2.3" class="nutrio-eye" />
        <circle cx="29" cy="16.5" r="2.3" class="nutrio-eye" />
        <g class="nutrio-thinking-dots">
          <circle cx="17" cy="28" r="1.15" class="nutrio-dot nutrio-dot1" />
          <circle cx="21.5" cy="28" r="1.15" class="nutrio-dot nutrio-dot2" />
          <circle cx="26" cy="28" r="1.15" class="nutrio-dot nutrio-dot3" />
        </g>
      </g>`,
    feliz: `
      <g class="nutrio-face nutrio-face-feliz">
        <path d="M10.5 18 q3.5 -4.8 7 0" class="nutrio-eye-happy" />
        <path d="M25.5 18 q3.5 -4.8 7 0" class="nutrio-eye-happy" />
        <ellipse cx="14" cy="24.5" rx="2.7" ry="1.7" class="nutrio-cheek nutrio-cheek-bright" />
        <ellipse cx="30" cy="24.5" rx="2.7" ry="1.7" class="nutrio-cheek nutrio-cheek-bright" />
        <path d="M13.5 25 q8 8.5 16 0" class="nutrio-mouth-big" />
      </g>`,
    sorprendido: `
      <g class="nutrio-face nutrio-face-sorprendido">
        <path d="M10 12.5 q3.5 -2.4 7 0" class="nutrio-eyebrow nutrio-eyebrow-up" />
        <path d="M26 12.5 q3.5 -2.4 7 0" class="nutrio-eyebrow nutrio-eyebrow-up" />
        <circle cx="14" cy="18" r="3.2" class="nutrio-eye" />
        <circle cx="30" cy="18" r="3.2" class="nutrio-eye" />
        <ellipse cx="22" cy="28.5" rx="3.2" ry="3.4" class="nutrio-mouth-o" />
        <path d="M4 9 l2 2 M40 9 l-2 2 M3 26 l2 -1.5 M41 26 l-2 -1.5" class="nutrio-sparkle" />
      </g>`,
    guino: `
      <g class="nutrio-face nutrio-face-guino">
        <path d="M10.5 18 q3.5 -3 7 0" class="nutrio-eye-closed" />
        <circle cx="29" cy="18" r="2.6" class="nutrio-eye" />
        <circle cx="30.1" cy="16.9" r="0.85" class="nutrio-eye-shine" />
        <ellipse cx="15" cy="24.5" rx="2.2" ry="1.3" class="nutrio-cheek" />
        <path d="M16 26.5 q6 3 11 0" class="nutrio-mouth-smirk" />
      </g>`,
    riendo: `
      <g class="nutrio-face nutrio-face-riendo">
        <path d="M8.5 17 q4.5 -7 9 0" class="nutrio-eye-happy" />
        <path d="M24.5 17 q4.5 -7 9 0" class="nutrio-eye-happy" />
        <ellipse cx="13.5" cy="25.5" rx="3" ry="1.9" class="nutrio-cheek nutrio-cheek-bright" />
        <ellipse cx="30.5" cy="25.5" rx="3" ry="1.9" class="nutrio-cheek nutrio-cheek-bright" />
        <path d="M10.5 23.5 q11 13 21 0" class="nutrio-mouth-big" />
        <text x="2" y="8" class="nutrio-haha nutrio-haha1">ja</text>
        <text x="34" y="6" class="nutrio-haha nutrio-haha2">ja</text>
      </g>`,
    llorando: `
      <g class="nutrio-face nutrio-face-llorando">
        <path d="M10.5 14.5 q3.5 3 7 0" class="nutrio-eyebrow" />
        <path d="M26.5 14.5 q3.5 3 7 0" class="nutrio-eyebrow" />
        <circle cx="14" cy="19.5" r="2.3" class="nutrio-eye" />
        <circle cx="30" cy="19.5" r="2.3" class="nutrio-eye" />
        <path d="M13 31 q9 -6.5 18 0" class="nutrio-mouth-sad" />
        <path d="M13.3 22.5 q-1 3 -0.6 6" class="nutrio-tear nutrio-tear-l" />
        <path d="M30.7 22.5 q1 3 0.6 6" class="nutrio-tear nutrio-tear-r" />
      </g>`
  },

  // Crea el avatar (una sola vez) como primer hijo del header del chat, así
  // queda a la izquierda del nombre "Nutrio" sin tener que tocar index.html.
  // Estructura: .nutrio-avatar-glass (burbuja + borde iridiscente animado
  // vía ::before, blur real por backdrop-filter) > svg (cuerpo + cara).
  _ensureEl() {
    if (this._el) return this._el;
    const header = document.querySelector('.chat-header');
    if (!header) return null;

    const size = this._SIZE;
    const wrap = document.createElement('div');
    wrap.id = 'nutrioAvatar';
    wrap.className = 'nutrio-avatar-glass';
    wrap.title = 'Nutrio';
    wrap.style.cssText = `width:${size}px; height:${size}px; flex-shrink:0; margin-right:12px;`;
    wrap.innerHTML = `
      <svg viewBox="0 0 44 44" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nutrioBodyGradient" cx="32%" cy="26%" r="80%">
            <stop offset="0%" stop-color="#f2f4f6" stop-opacity="0.97" />
            <stop offset="55%" stop-color="#c7ccd1" stop-opacity="0.65" />
            <stop offset="100%" stop-color="#8a919b" stop-opacity="0.30" />
          </radialGradient>
          <linearGradient id="nutrioRimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.95)" />
            <stop offset="45%" stop-color="#9aa3ad" stop-opacity="0.65" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.15)" />
          </linearGradient>
        </defs>
        <!-- Antena de robot -->
        <line x1="22" y1="3.5" x2="22" y2="-1.5" class="nutrio-avatar-antenna-stem" />
        <circle cx="22" cy="-2.2" r="1.9" class="nutrio-avatar-antenna-tip" />
        <circle cx="22" cy="22" r="19.2" class="nutrio-avatar-body" />
        <circle cx="22" cy="22" r="19.2" class="nutrio-avatar-rim" />
        <!-- Auriculares/laterales de robot -->
        <rect x="1.2" y="18" width="3" height="8" rx="1.5" class="nutrio-avatar-earpiece" />
        <rect x="39.8" y="18" width="3" height="8" rx="1.5" class="nutrio-avatar-earpiece" />
        <ellipse cx="14.5" cy="11.5" rx="6.5" ry="4.2" class="nutrio-avatar-shine-big" />
        <circle cx="16" cy="12.5" r="2.6" class="nutrio-avatar-shine" />
        <ellipse cx="30" cy="32" rx="4.5" ry="2.4" class="nutrio-avatar-shine-low" />
        <g id="nutrioAvatarFace"></g>
      </svg>`;

    header.insertBefore(wrap, header.firstChild);
    this._el = wrap;
    this._injectStyles();
    return wrap;
  },

  _injectStyles() {
    if (document.getElementById('nutrioAvatarStyles')) return;
    const style = document.createElement('style');
    style.id = 'nutrioAvatarStyles';
    style.textContent = `
      /* --- Burbuja de vidrio (liquid glass) --- */
      .nutrio-avatar-glass {
        position: relative;
        border-radius: 50%;
        cursor: pointer;
        background: linear-gradient(150deg, rgba(255,255,255,0.55), rgba(255,255,255,0.12));
        -webkit-backdrop-filter: blur(14px) saturate(160%);
        backdrop-filter: blur(14px) saturate(160%);
        box-shadow:
          0 1px 1px rgba(255,255,255,0.85) inset,
          0 -6px 10px rgba(76,175,80,0.10) inset,
          0 10px 22px -8px rgba(20,83,45,0.28),
          0 2px 6px rgba(20,83,45,0.12);
        transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
        will-change: transform;
        animation: nutrioFloatIdle 4.6s ease-in-out infinite;
      }
      /* Borde iridiscente que gira despacio, sutil, típico "liquid glass" */
      .nutrio-avatar-glass::before {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        background: conic-gradient(from 0deg,
          rgba(255,255,255,0) 0%,
          rgba(255,255,255,0.85) 12%,
          rgba(76,175,80,0.55) 30%,
          rgba(255,255,255,0) 50%,
          rgba(255,183,77,0.45) 72%,
          rgba(255,255,255,0) 90%,
          rgba(255,255,255,0) 100%);
        -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
                mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
        animation: nutrioRimRotate 7s linear infinite;
        opacity: 0.9;
        pointer-events: none;
      }
      /* Puntito de luz ambiental que se pasea despacio por el vidrio */
      .nutrio-avatar-glass::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: radial-gradient(circle 8px at 30% 25%, rgba(255,255,255,0.5), transparent 70%);
        animation: nutrioAmbientDrift 5.5s ease-in-out infinite;
        pointer-events: none;
        mix-blend-mode: screen;
      }
      .nutrio-avatar-glass:hover {
        transform: translateY(-1px) scale(1.03);
      }
      .nutrio-avatar-glass:active {
        transform: scale(0.94);
      }
      .nutrio-avatar-glass svg { display:block; overflow:visible; position: relative; z-index: 1; }

      .nutrio-avatar-body {
        fill: url(#nutrioBodyGradient);
      }
      .nutrio-avatar-rim {
        fill: none;
        stroke: url(#nutrioRimGradient);
        stroke-width: 1.4;
        opacity: 0.9;
      }
      .nutrio-avatar-shine-big {
        fill: rgba(255,255,255,0.55);
        filter: blur(1.5px);
        pointer-events: none;
      }
      .nutrio-avatar-shine {
        fill: rgba(255,255,255,0.85);
        pointer-events: none;
      }
      .nutrio-avatar-shine-low {
        fill: rgba(255,255,255,0.18);
        filter: blur(2px);
        pointer-events: none;
      }
      .nutrio-avatar-antenna-stem {
        stroke: #9aa3ad;
        stroke-width: 1.6;
        stroke-linecap: round;
      }
      .nutrio-avatar-antenna-tip {
        fill: var(--primary, #4caf50);
        stroke: #9aa3ad;
        stroke-width: 1;
        animation: nutrioTwinkle 2.4s ease-in-out infinite;
      }
      .nutrio-avatar-earpiece {
        fill: #c7ccd1;
        stroke: #9aa3ad;
        stroke-width: 1;
      }

      /* --- Cara --- */
      .nutrio-face path, .nutrio-face circle, .nutrio-face ellipse {
        stroke: #5b636d;
        stroke-width: 1.9;
        fill: none;
        stroke-linecap: round;
      }
      .nutrio-face .nutrio-eye, .nutrio-face .nutrio-mouth-o { fill: #5b636d; }
      .nutrio-face .nutrio-eye-shine {
        fill: rgba(255,255,255,0.95);
        stroke: none;
      }
      .nutrio-eye-group { transform-box: fill-box; transform-origin: center; }
      .nutrio-face .nutrio-cheek {
        fill: none;
        stroke: none;
        opacity: 0;
      }
      .nutrio-face .nutrio-cheek-bright { opacity: 0; }
      .nutrio-face .nutrio-eyebrow { stroke-width: 2; }
      .nutrio-face .nutrio-mouth-smirk { stroke-width: 2; }
      .nutrio-face .nutrio-sparkle {
        stroke: var(--accent-desayuno, #ffb74d);
        stroke-width: 1.6;
      }
      .nutrio-face .nutrio-dot {
        fill: #5b636d;
        stroke: none;
        transform-box: fill-box;
        transform-origin: center;
        animation: nutrioDotBounce 1.1s ease-in-out infinite;
      }
      .nutrio-face .nutrio-dot1 { animation-delay: 0s; }
      .nutrio-face .nutrio-dot2 { animation-delay: 0.15s; }
      .nutrio-face .nutrio-dot3 { animation-delay: 0.3s; }
      .nutrio-zzz {
        font-size: 6px;
        font-weight: 700;
        fill: #5b636d;
        opacity: 0;
      }
      .nutrio-zzz1 { animation: nutrioZzzFloat 2.4s ease-in-out infinite; }
      .nutrio-zzz2 { animation: nutrioZzzFloat 2.4s ease-in-out infinite 0.7s; }

      /* --- Cara riendo (👍) --- */
      .nutrio-haha {
        font-size: 6px;
        font-weight: 700;
        fill: #ffb74d;
        opacity: 0;
      }
      .nutrio-haha1 { animation: nutrioHahaFloat 0.9s ease-out infinite; }
      .nutrio-haha2 { animation: nutrioHahaFloat 0.9s ease-out infinite 0.25s; }

      /* --- Cara llorando (👎) --- */
      .nutrio-face .nutrio-mouth-sad {
        stroke: #5b636d;
        fill: none;
      }
      .nutrio-face .nutrio-tear {
        stroke: #54a0ff;
        stroke-width: 1.7;
        fill: none;
        opacity: 0;
        animation: nutrioTearFall 1.1s ease-in infinite;
      }
      .nutrio-tear-r { animation-delay: 0.35s; }

      /* --- Estados: animación en la burbuja entera, más orgánica que un
         simple scale plano, para que se sienta "viva" y con peso/gelatina --- */
      #nutrioAvatar.is-dormido {
        animation: nutrioGlassBreathe 3.2s ease-in-out infinite;
      }
      #nutrioAvatar.is-dormido::before { animation-play-state: paused; opacity: 0.35; }
      #nutrioAvatar.is-despierto .nutrio-eye-group-l {
        animation: nutrioBlink 5.2s ease-in-out infinite;
      }
      #nutrioAvatar.is-despierto .nutrio-eye-group-r {
        animation: nutrioBlink 5.2s ease-in-out infinite 0.18s;
      }
      #nutrioAvatar.is-despierto {
        box-shadow:
          0 1px 1px rgba(255,255,255,0.85) inset,
          0 -6px 10px rgba(76,175,80,0.14) inset,
          0 10px 22px -8px rgba(20,83,45,0.32),
          0 0 0 3px rgba(76,175,80,0.10);
      }
      #nutrioAvatar.is-pensando {
        animation: nutrioGlassTilt 1.6s ease-in-out infinite;
      }
      #nutrioAvatar.is-feliz {
        animation: nutrioGlassBounce 0.55s cubic-bezier(.34,1.56,.64,1);
      }
      #nutrioAvatar.is-sorprendido {
        animation: nutrioGlassPop 0.7s cubic-bezier(.34,1.56,.64,1);
        box-shadow:
          0 1px 1px rgba(255,255,255,0.9) inset,
          0 -6px 10px rgba(255,183,77,0.22) inset,
          0 10px 26px -8px rgba(20,83,45,0.32),
          0 0 0 4px rgba(255,183,77,0.20);
      }
      #nutrioAvatar.is-sorprendido .nutrio-sparkle { animation: nutrioTwinkle 0.7s ease-in-out infinite; transform-origin: center; }
      #nutrioAvatar.is-guino {
        animation: nutrioGlassWink 0.4s ease-out;
      }
      /* 👍 "me gusta": se agranda un montón y se ríe a las carcajadas */
      #nutrioAvatar.is-riendo {
        animation: nutrioGlassLaugh 1.1s cubic-bezier(.34,1.56,.64,1);
        box-shadow:
          0 1px 1px rgba(255,255,255,0.9) inset,
          0 -6px 10px rgba(255,183,77,0.22) inset,
          0 12px 28px -8px rgba(20,83,45,0.34),
          0 0 0 4px rgba(76,175,80,0.18);
      }
      /* 👎 "no me gusta": se cae de costado y se pone a llorar */
      #nutrioAvatar.is-llorando {
        animation: nutrioGlassFall 1.4s cubic-bezier(.36,.07,.19,.97);
      }

      @keyframes nutrioFloatIdle {
        0%, 100% { margin-top: 0px; }
        50% { margin-top: -2px; }
      }
      @keyframes nutrioRimRotate {
        to { transform: rotate(360deg); }
      }
      @keyframes nutrioAmbientDrift {
        0%, 100% { background-position: 0 0; opacity: 0.7; }
        50% { background-position: 6px 4px; opacity: 1; }
      }
      @keyframes nutrioGlassBreathe {
        0%, 100% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.035); filter: brightness(1.03); }
      }
      @keyframes nutrioZzzFloat {
        0% { opacity: 0; transform: translateY(0); }
        30% { opacity: 1; }
        100% { opacity: 0; transform: translateY(-9px); }
      }
      @keyframes nutrioBlink {
        0%, 92%, 100% { transform: scaleY(1); }
        96% { transform: scaleY(0.1); }
      }
      @keyframes nutrioDotBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.55; }
        30% { transform: translateY(-2.2px); opacity: 1; }
      }
      @keyframes nutrioGlassTilt {
        0%, 100% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(-6deg) scale(1.02); }
      }
      @keyframes nutrioGlassBounce {
        0% { transform: scale(1) translateY(0); }
        30% { transform: scale(1.14) translateY(-6px); }
        60% { transform: scale(0.96) translateY(1px); }
        100% { transform: scale(1) translateY(0); }
      }
      @keyframes nutrioGlassPop {
        0% { transform: scale(1) rotate(0deg); }
        35% { transform: scale(1.28) rotate(-4deg); }
        65% { transform: scale(0.93) rotate(3deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes nutrioTwinkle {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
      @keyframes nutrioGlassWink {
        0% { transform: scale(1); }
        50% { transform: scale(1.08) rotate(-3deg); }
        100% { transform: scale(1); }
      }
      @keyframes nutrioGlassLaugh {
        0% { transform: scale(1) rotate(0deg); }
        18% { transform: scale(1.4) rotate(-8deg); }
        38% { transform: scale(1.28) rotate(7deg); }
        58% { transform: scale(1.34) rotate(-6deg); }
        78% { transform: scale(1.16) rotate(4deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes nutrioGlassFall {
        0% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(2px) rotate(20deg); }
        45% { transform: translateY(13px) rotate(78deg); }
        65% { transform: translateY(15px) rotate(92deg); }
        85% { transform: translateY(15px) rotate(88deg); }
        100% { transform: translateY(0) rotate(0deg); }
      }
      @keyframes nutrioTearFall {
        0% { opacity: 0; transform: translateY(0); }
        15% { opacity: 1; }
        100% { opacity: 0; transform: translateY(7px); }
      }
      @keyframes nutrioHahaFloat {
        0% { opacity: 0; transform: translateY(0) scale(0.8); }
        30% { opacity: 1; transform: translateY(-3px) scale(1); }
        100% { opacity: 0; transform: translateY(-10px) scale(1.1); }
      }

      /* Fallback: si el navegador no soporta backdrop-filter, que igual se
         vea sólido y prolijo en vez de transparente/roto. */
      @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
        .nutrio-avatar-glass { background: var(--primary-dim, #eef7ee); }
        .nutrio-avatar-glass::before { display: none; }
      }
      /* Respeta a quien prefiere menos movimiento */
      @media (prefers-reduced-motion: reduce) {
        .nutrio-avatar-glass,
        .nutrio-avatar-glass::before,
        .nutrio-avatar-glass::after,
        .nutrio-face * {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
        }
      }
    `;
    document.head.appendChild(style);
  },

  setState(state) {
    const wrap = this._ensureEl();
    if (!wrap) return;
    this._state = state;
    wrap.classList.remove('is-dormido', 'is-despierto', 'is-pensando', 'is-feliz', 'is-sorprendido', 'is-guino', 'is-riendo', 'is-llorando');
    wrap.classList.add(`is-${state}`);
    const faceContainer = wrap.querySelector('#nutrioAvatarFace');
    if (faceContainer) faceContainer.innerHTML = this._FACES[state] || this._FACES.despierto;
  },

  // Reinicia el contador de inactividad: si pasan _IDLE_MS sin actividad
  // nueva, Nutrio se vuelve a dormir solo (salvo que esté "pensando").
  _resetIdleTimer() {
    if (this._idleTimer) clearTimeout(this._idleTimer);
    this._idleTimer = setTimeout(() => {
      if (this._state !== 'pensando') this.setState('dormido');
    }, this._IDLE_MS);
  },

  wake() {
    if (this._state === 'dormido') this.setState('despierto');
    this._resetIdleTimer();
  },

  thinking() {
    if (this._idleTimer) clearTimeout(this._idleTimer);
    this.setState('pensando');
  },

  // Festejo cortito (saltito + carita feliz) y después vuelve a 'despierto'.
  // Se usa en cada mensaje nuevo del chat (ver _pushBotMessage / sendChat).
  happy() {
    this.setState('feliz');
    setTimeout(() => {
      if (this._state === 'feliz') this.setState('despierto');
      this._resetIdleTimer();
    }, 900);
  },

  // Reacción grande, reservada para momentos especiales: nueva racha,
  // logro desbloqueado, día permitido activado, etc. Dura más que happy()
  // y usa la carita 'sorprendido' con chispitas alrededor.
  excited() {
    if (this._idleTimer) clearTimeout(this._idleTimer);
    this.setState('sorprendido');
    setTimeout(() => {
      if (this._state === 'sorprendido') this.setState('despierto');
      this._resetIdleTimer();
    }, 1500);
  },

  // Guiño juguetón puntual (uso opcional, por ejemplo en algún tip o chiste
  // del bot). Vuelve solo al estado anterior después de un ratito.
  wink() {
    const previous = this._state === 'guino' ? 'despierto' : this._state;
    if (this._idleTimer) clearTimeout(this._idleTimer);
    this.setState('guino');
    setTimeout(() => {
      if (this._state === 'guino') this.setState(previous === 'dormido' ? 'despierto' : previous);
      this._resetIdleTimer();
    }, 800);
  },

  // Reacción al 👍 "Me gusta" de una respuesta del chat: la burbuja se
  // agranda bastante y la carita se ríe a las carcajadas (con "ja ja"
  // flotando). Después vuelve sola a 'despierto'.
  laugh() {
    if (this._idleTimer) clearTimeout(this._idleTimer);
    this.setState('riendo');
    setTimeout(() => {
      if (this._state === 'riendo') this.setState('despierto');
      this._resetIdleTimer();
    }, 1200);
  },

  // Reacción al 👎 "No me gusta" de una respuesta del chat: la burbuja se
  // cae de costado y la carita llora (lagrimitas cayendo). Después se
  // reincorpora sola y vuelve a 'despierto'.
  cryFall() {
    if (this._idleTimer) clearTimeout(this._idleTimer);
    this.setState('llorando');
    setTimeout(() => {
      if (this._state === 'llorando') this.setState('despierto');
      this._resetIdleTimer();
    }, 1600);
  },

  init() {
    this._ensureEl();
    this.setState('dormido');

    // Se despierta si tocás o escribís en el input del chat.
    const input = document.getElementById('chatInput');
    if (input) {
      input.addEventListener('focus', () => this.wake());
      input.addEventListener('input', () => this.wake());
    }

    // Tocar al propio Nutrio le saca un guiño simpático (easter egg chiquito).
    if (this._el) {
      this._el.addEventListener('click', () => this.wink());
    }
  }
};

const UI = {

  // Guarda referencias de recetas (y su bebida sugerida) para poder abrir
  // el modal sin serializar objetos completos dentro de atributos HTML.
  _recipeRefs: {},

  // Texto plano de cada respuesta del bot, guardado por msgId, para poder
  // leerlo en voz alta con el botón 🔊 sin tener que volver a parsear el HTML.
  _chatTextRefs: {},

  init() {
    // IMPORTANTE: Primero le damos vida a las escuchas de los chips pase lo que pase
    Onboarding.bindAllChips();
    this._bindTapFeedback();
    this._bindChatInputAutoGrow();
    this._injectSpeechToggle();
    NutrioAvatar.init();

    const firstTimeEl = document.getElementById('chatFirstMsgTime');
    if (firstTimeEl) firstTimeEl.innerText = this._formatTime(new Date());

    const profile = StorageApp.getProfile();
    if (!profile) {
      document.getElementById('onboarding').style.display = 'flex';
      document.getElementById('app').style.display = 'none';
      Onboarding.initWizard();
      return;
    }

    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    this.renderHome();
    this.renderWeeklyPlan();
    this.renderCart();
    this.renderProfile();
    this.goto('chat');

    this._handleDailyEngagement();
  },

  // Racha + logros + notificaciones: se corre una vez por carga de app,
  // después de que el chat ya está visible, así los mensajes de racha o
  // de logros nuevos aparecen como mensajes del bot al toque. Usamos la
  // reacción 'excited' del avatar (más grande que la de un mensaje común)
  // para que estos momentos se sientan especiales.
  _handleDailyEngagement() {
    const streakResult = Streak.checkIn();

    if (streakResult.isNewDay && streakResult.count > 1) {
      const msg = streakResult.brokeStreak
        ? `Che, se cortó tu racha anterior, pero arrancamos una nueva hoy 💪. ¡Vamos de nuevo!`
        : `🔥 ¡Racha de ${streakResult.count} días seguidos usando NutrIO! Seguí así.`;
      this._pushBotMessage(msg, 'excited');
    }

    const newBadges = Achievements.checkAndUnlock();
    newBadges.forEach(badge => {
      this._pushBotMessage(`🎉 ¡Nuevo logro desbloqueado! ${badge.icon} **${badge.name}** — ${badge.desc}`, 'excited');
    });

    this.renderProfile();

    if (Notifications.isEnabled()) Notifications.start();
  },

  // ----------------------------------------------------------------------
  // EFECTO DE ESCRITURA (typewriter): revela un HTML letra por letra dentro
  // de un elemento, respetando los tags (<b>, <br>, etc. se insertan
  // enteros de una, no se "escriben" caracter a caracter, para no romper
  // el marcado a la mitad). Se usa tanto en sendChat como en
  // _pushBotMessage para que TODAS las respuestas del bot tengan el mismo
  // efecto.
  //
  // Devuelve una Promise que resuelve cuando terminó de escribir todo.
  // "onTick" (opcional) se llama en cada caracter agregado, útil para
  // mantener el scroll del chat pegado abajo mientras se escribe.
  // ----------------------------------------------------------------------
  TYPEWRITER_SPEED_MS: 16,

  _typeWriterEffect(el, html, onTick) {
    if (!el) return Promise.resolve();

    // Inyecta el CSS del cursor parpadeante una sola vez (mismo patrón que
    // typingIndicatorStyles), así no hace falta tocar el CSS a mano.
    if (!document.getElementById('typewriterStyles')) {
      const style = document.createElement('style');
      style.id = 'typewriterStyles';
      style.textContent = `
        .msg-bubble.bot.is-typing::after {
          content: '';
          display: inline-block;
          width: 2px;
          height: 1em;
          margin-left: 2px;
          vertical-align: text-bottom;
          background: currentColor;
          opacity: 0.6;
          animation: nutrioCursorBlink 0.8s step-start infinite;
        }
        @keyframes nutrioCursorBlink { 50% { opacity: 0; } }
      `;
      document.head.appendChild(style);
    }

    // Si el usuario tiene activado "reducir movimiento" en su sistema,
    // no tiene sentido forzar la animación: se pinta todo de una.
    const prefersReducedMotion = window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      el.innerHTML = html;
      return Promise.resolve();
    }

    const tokens = html.match(/(<[^>]+>|[^<]+)/g) || [];
    let revealed = '';
    let tokenIdx = 0;
    let charIdx = 0;

    el.innerHTML = '';
    el.classList.add('is-typing');

    return new Promise((resolve) => {
      const tick = () => {
        if (tokenIdx >= tokens.length) {
          el.innerHTML = html; // asegura que quede EXACTAMENTE el HTML original
          el.classList.remove('is-typing');
          resolve();
          return;
        }
        const token = tokens[tokenIdx];
        if (token.charAt(0) === '<') {
          // Tag completo (ej. <b>, </b>, <br>): se agrega entero, sin demora
          // caracter a caracter, para no dejarlo a medio escribir.
          revealed += token;
          el.innerHTML = revealed;
          tokenIdx++;
          charIdx = 0;
          tick();
          return;
        }
        revealed += token[charIdx];
        el.innerHTML = revealed;
        if (onTick) onTick();
        charIdx++;
        if (charIdx >= token.length) {
          tokenIdx++;
          charIdx = 0;
        }
        setTimeout(tick, this.TYPEWRITER_SPEED_MS);
      };
      tick();
    });
  },

  // Inserta un mensaje del bot en el chat sin pasar por sendChat (para
  // mensajes automáticos como racha/logros, no respuestas a algo escrito).
  // "reaction" controla qué animación pega el avatar: 'happy' (default,
  // saltito normal) o 'excited' (reacción grande, para racha/logros).
  async _pushBotMessage(text, reaction) {
    const scroll = document.getElementById('chatScroll');
    if (!scroll) return;
    const msgId = 'chatmsg_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const now = new Date();
    this._chatTextRefs[msgId] = text;
    scroll.innerHTML += `
      <div class="msg-row bot" id="${msgId}">
        <div class="msg-wrap">
          <div class="msg-bubble bot" id="${msgId}_bubble"></div>
          <div class="msg-time">${this._formatTime(now)}</div>
          <div class="chat-feedback">
            <button type="button" data-role="speak" title="Escuchar" onclick="UI.speakMessage('${msgId}')">🔊</button>
          </div>
        </div>
      </div>`;
    scroll.scrollTop = scroll.scrollHeight;
    if (reaction === 'excited') NutrioAvatar.excited();
    else NutrioAvatar.happy();
    if (Speech.enabled) Speech.speak(text);

    const bubble = document.getElementById(`${msgId}_bubble`);
    await this._typeWriterEffect(bubble, text, () => {
      scroll.scrollTop = scroll.scrollHeight;
    });
  },

  // ----------------------------------------------------------------------
  // INDICADOR DE "ESCRIBIENDO...": se muestra apenas se manda un mensaje y
  // se saca justo antes de pintar la respuesta (venga de la IA o de las
  // reglas). Usa un id fijo así siempre hay a lo sumo un indicador en
  // pantalla, sin importar cuántas veces se llame a _showTypingIndicator.
  // ----------------------------------------------------------------------
  _showTypingIndicator() {
    this._hideTypingIndicator();
    const scroll = document.getElementById('chatScroll');
    if (!scroll) return;
    scroll.innerHTML += `
      <div class="msg-row bot" id="typingIndicator">
        <div class="msg-wrap">
          <div class="msg-bubble bot typing-bubble">
            <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
          </div>
        </div>
      </div>`;
    scroll.scrollTop = scroll.scrollHeight;

    // Inyecta el CSS de los puntitos una sola vez, así no hace falta tocar
    // el archivo de estilos a mano para que esto se vea bien.
    if (!document.getElementById('typingIndicatorStyles')) {
      const style = document.createElement('style');
      style.id = 'typingIndicatorStyles';
      style.textContent = `
        .typing-bubble { display:flex; align-items:center; gap:4px; padding:12px 14px; }
        .typing-dot { width:6px; height:6px; border-radius:50%; background:currentColor; opacity:0.4;
          animation: nutrioTypingBlink 1.2s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes nutrioTypingBlink { 0%, 80%, 100% { opacity: 0.2; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }
      `;
      document.head.appendChild(style);
    }
  },

  _hideTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
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

  // Agrega los botones 🔈/🔊 (auto-hablar) y 🔔 (notificaciones) arriba, al
  // lado del nombre "Nutrio" en el header del chat, y el botón 🥕 (buscar
  // por ingredientes) a la IZQUIERDA de la barra de chat (antes del input
  // de texto). Se inserta una sola vez (chequea si ya existe) y refleja el
  // estado guardado en Speech.enabled / Notifications.isEnabled().
  _injectSpeechToggle() {
    if (document.getElementById('speechToggleBtn')) return;

    // --- Controles de voz/notificaciones arriba, al lado del nombre "Nutrio" ---
    const header = document.querySelector('.chat-header');
    if (header) {
      let headerControls = document.getElementById('chatHeaderControls');
      if (!headerControls) {
        headerControls = document.createElement('div');
        headerControls.id = 'chatHeaderControls';
        headerControls.style.cssText = 'margin-left:auto; display:flex; align-items:center; gap:2px;';
        header.appendChild(headerControls);
      }

      const btn = document.createElement('button');
      btn.id = 'speechToggleBtn';
      btn.type = 'button';
      btn.title = 'Que Nutrio te hable en voz alta';
      btn.style.cssText = 'background:none; border:none; font-size:20px; cursor:pointer; padding:0 6px; line-height:1;';
      btn.innerText = Speech.enabled ? '🔊' : '🔈';
      btn.onclick = () => {
        const isOn = Speech.toggle();
        btn.innerText = isOn ? '🔊' : '🔈';
      };
      headerControls.appendChild(btn);

      // Botón de recordatorios: pide permiso de notificaciones la primera vez
      // y prende/apaga los avisos de "¿ya comiste?" en cada franja horaria.
      const notifBtn = document.createElement('button');
      notifBtn.id = 'notifToggleBtn';
      notifBtn.type = 'button';
      notifBtn.title = 'Recordatorios de comidas';
      notifBtn.style.cssText = 'background:none; border:none; font-size:18px; cursor:pointer; padding:0 6px; line-height:1;';
      notifBtn.innerText = Notifications.isEnabled() ? '🔔' : '🔕';
      notifBtn.onclick = async () => {
        await Notifications.toggle();
        notifBtn.innerText = Notifications.isEnabled() ? '🔔' : '🔕';
      };
      headerControls.appendChild(notifBtn);
    }

    // --- Botón de ingredientes: a la IZQUIERDA de la barra de chat ---
    const inner = document.querySelector('.chat-input-inner');
    if (inner && !document.getElementById('chatIngredientsBtn')) {
      const ingBtn = document.createElement('button');
      ingBtn.id = 'chatIngredientsBtn';
      ingBtn.type = 'button';
      ingBtn.title = 'Buscar recetas por ingredientes que tenés';
      ingBtn.style.cssText = 'background:none; border:none; font-size:20px; cursor:pointer; padding:0 6px; line-height:1; flex-shrink:0;';
      ingBtn.innerText = '🥕';
      ingBtn.onclick = () => UI.openIngredientPicker();

      inner.insertBefore(ingBtn, inner.firstChild);
    }

    if (Notifications.isEnabled()) Notifications.start();
  },

  // Muestra, como mensaje del bot, las voces en español instaladas en el
  // dispositivo/navegador para que el usuario pruebe y elija cuál le suena
  // mejor (la calidad varía muchísimo entre celulares). La elección queda
  // guardada y se usa a partir de ahí en todas las lecturas.
  // NOTA: el botón 🎙️ que abría este picker desde el header fue removido;
  // esta función queda disponible por si se la quiere invocar desde otro lado.
  openVoicePicker() {
    const scroll = document.getElementById('chatScroll');
    if (!scroll) return;

    let voices = Speech.getSpanishVoices();
    // En algunos navegadores la lista de voces carga async; si todavía no
    // hay nada, forzamos la carga y reintentamos apenas estén listas.
    if (!voices.length && Speech._supported()) {
      window.speechSynthesis.onvoiceschanged = () => this.openVoicePicker();
      window.speechSynthesis.getVoices();
    }

    const now = new Date();
    const currentName = localStorage.getItem('nutrio_speech_voice_name');

    let bodyHTML;
    if (!voices.length) {
      bodyHTML = `Todavía no encontré voces en español en este dispositivo/navegador. Probá tocar el 🔊 de algún mensaje mío primero (a veces recién ahí el navegador carga la lista de voces) y volvé a intentar.`;
    } else {
      const chips = voices.map(v => {
        const isActive = v.name === currentName;
        const safeName = v.name.replace(/"/g, '&quot;');
        return `<span class="chip-sm tap-feedback ${isActive ? 'active' : ''}" data-voice="${safeName}" onclick="UI.tryVoice(this)">${v.name}${isActive ? ' ✅' : ''}</span>`;
      }).join('');
      bodyHTML = `Estas son las voces en español que encontré en tu dispositivo. Tocá una para escucharla y dejarla puesta:<div class="ingredient-picker-chips">${chips}</div>`;
    }

    scroll.innerHTML += `
      <div class="msg-row bot">
        <div class="msg-wrap">
          <div class="msg-bubble bot">${bodyHTML}</div>
          <div class="msg-time">${this._formatTime(now)}</div>
        </div>
      </div>`;
    scroll.scrollTop = scroll.scrollHeight;
  },

  // Fija la voz tocada como preferida, la prueba con una frase corta, y
  // actualiza los chips de ese mismo picker para reflejar la nueva selección.
  tryVoice(chipEl) {
    const name = chipEl.dataset.voice;
    if (!name) return;

    Speech.setVoice(name);
    Speech.speak('Hola, así sueno yo ahora. ¿Te gusto más?');

    const container = chipEl.closest('.ingredient-picker-chips');
    if (container) {
      container.querySelectorAll('.chip-sm').forEach(c => {
        c.classList.remove('active');
        c.innerText = c.dataset.voice;
      });
    }
    chipEl.classList.add('active');
    chipEl.innerText = `${name} ✅`;
  },

  // Lee en voz alta un mensaje del bot ya guardado en _chatTextRefs (botón 🔊 individual).
  speakMessage(msgId) {
    const text = this._chatTextRefs[msgId];
    if (text) Speech.speak(text);
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

    if (viewName === 'chat') NutrioAvatar.wake();
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
    this._ensureShuffleButtonStyles();
    const meta = MEAL_META[typeKey] || MEAL_META.antojo;
    const ingredientsPreview = (recipe.ingredients || []).join(', ');
    const drinkPreview = this._buildDrinkPreviewHTML(drink);

    return `
      <div class="meal-card tap-feedback" style="--accent:${meta.color}; --accent-dim:${meta.dim}; position:relative;" onclick="UI.openRecipeModalByRef('${refId}')">
        <button type="button" class="meal-card-shuffle tap-feedback" title="Dame otra receta" aria-label="Dame otra receta"
          onclick="event.stopPropagation(); UI.shuffleMealCard(event, '${refId}')">🔀</button>
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

  // Inyecta el CSS del botón 🔀 de "otra receta" una sola vez, así no hace
  // falta tocar la hoja de estilos a mano para que se vea bien.
  _ensureShuffleButtonStyles() {
    if (document.getElementById('shuffleButtonStyles')) return;
    const style = document.createElement('style');
    style.id = 'shuffleButtonStyles';
    style.textContent = `
      .meal-card-shuffle {
        position: absolute; top: 10px; right: 10px; z-index: 2;
        width: 30px; height: 30px; border-radius: 50%; border: none;
        background: var(--accent-dim); color: var(--accent);
        font-size: 14px; line-height: 1; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: transform .12s ease;
      }
      .meal-card-shuffle:active, .meal-card-shuffle.pressed { transform: scale(0.88); }
      .meal-card-shuffle.is-shuffling { animation: nutrioShuffleSpin .5s ease; }
      @keyframes nutrioShuffleSpin { from { transform: rotate(0deg); } to { transform: rotate(180deg); } }
    `;
    document.head.appendChild(style);
  },

  // --------------------------------------------------------------------
  // Botón 🔀 de las tarjetas: reemplaza la receta (y su bebida sugerida)
  // por otra opción al azar del mismo pool filtrado por perfil (respeta
  // alergias/restricciones/condiciones de salud, igual que el resto de la
  // app), evitando repetir la receta que ya se estaba mostrando en ESA
  // tarjeta puntual. Re-renderiza solo la tarjeta tocada, sin recargar el
  // resto de Inicio/Semana.
  // --------------------------------------------------------------------
  shuffleMealCard(event, refId) {
    const ref = this._recipeRefs[refId];
    if (!ref) return;
    const profile = StorageApp.getProfile();
    if (!profile || typeof MealEngine === 'undefined' || typeof RECIPES_DB === 'undefined') return;

    const { typeKey } = ref;
    const category = SLOT_TO_CATEGORY[typeKey];
    if (!category) return;

    const isSunday = typeof MealEngine.isCheatDay === 'function'
      ? MealEngine.isCheatDay(new Date())
      : (new Date().getDay() === 0);

    let pool = MealEngine.filterRecipesForProfile(category, profile, isSunday) || [];
    if (typeof MealEngine.refineByKcal === 'function') pool = MealEngine.refineByKcal(pool, profile, category);
    if (!pool.length && typeof getRecipesByCategory === 'function') pool = getRecipesByCategory(category);
    if (!pool.length) return;

    // Evita repetir la receta actual de ESTA tarjeta cuando hay otras opciones.
    const currentId = ref.recipe ? (ref.recipe.id !== undefined ? ref.recipe.id : ref.recipe.name) : null;
    let choices = pool;
    if (pool.length > 1) {
      const withoutCurrent = pool.filter(r => (r.id !== undefined ? r.id : r.name) !== currentId);
      if (withoutCurrent.length) choices = withoutCurrent;
    }
    const newRecipe = choices[Math.floor(Math.random() * choices.length)];

    // También sorteamos una bebida nueva para que combine con la nueva
    // receta (si no hay bebidas cargadas para la categoría, se mantiene la
    // que ya tenía la tarjeta).
    let newDrink = ref.drink || null;
    if (typeof BEBIDAS_DB !== 'undefined' && BEBIDAS_DB[category]) {
      const options = BEBIDAS_DB[category];
      const sinOpciones = options.sinAlcohol || [];
      const conOpciones = isSunday ? (options.conAlcohol || []) : [];
      if (sinOpciones.length) {
        const sinPick = sinOpciones[Math.floor(Math.random() * sinOpciones.length)];
        const conPick = conOpciones.length ? conOpciones[Math.floor(Math.random() * conOpciones.length)] : null;
        newDrink = { sinAlcohol: sinPick, conAlcohol: conPick };
      }
    }

    const cardEl = event && event.target ? event.target.closest('.meal-card') : null;
    if (!cardEl) return;

    // Pequeño delay para que se alcance a ver el giro del botón antes de
    // reemplazar la tarjeta (si se reemplaza en el mismo instante, la
    // animación no llega a notarse porque el elemento viejo desaparece).
    const shuffleBtn = cardEl.querySelector('.meal-card-shuffle');
    if (shuffleBtn) shuffleBtn.classList.add('is-shuffling');

    setTimeout(() => {
      cardEl.outerHTML = this._buildMealCardHTML(refId, typeKey, newRecipe, newDrink);
    }, 150);
  },

  renderHome() {
    const profile = StorageApp.getProfile();
    if (!profile || typeof RECIPES_DB === 'undefined' || typeof MealEngine === 'undefined') return;
    // Usamos el apodo si lo cargó en el onboarding; si no, caemos al nombre real.
    document.getElementById('homeGreeting').innerText = `¡Hola, ${profile.nickname || profile.name}!`;
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

    // Guardamos la receta actual del modal para poder registrarla con
    // "Ya lo comí" sin tener que meter objetos completos en el onclick.
    this._modalRecipe = { recipe, typeKey };
    const yaComidoHoy = MealLog.getToday().some(e => e.name === recipe.name);

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

      <button type="button" id="logMealBtn" onclick="UI.logCurrentModalMeal()"
        style="width:100%; margin-top:16px; padding:12px; border:none; border-radius:10px; font-weight:bold; cursor:pointer;
        background:${yaComidoHoy ? 'var(--primary-dim, #e0e0e0)' : 'var(--primary)'}; color:${yaComidoHoy ? 'var(--text)' : 'white'};">
        ${yaComidoHoy ? '✅ Ya lo anotaste hoy' : '✅ Ya lo comí — anotarlo'}
      </button>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  // Registra en MealLog la receta que está abierta en el modal en este momento.
  logCurrentModalMeal() {
    if (!this._modalRecipe) return;
    const { recipe, typeKey } = this._modalRecipe;
    MealLog.add({ name: recipe.name, kcal: recipe.kcal || null, slot: typeKey });
    Achievements.trackRecipeTried(recipe.id !== undefined ? recipe.id : recipe.name);

    const btn = document.getElementById('logMealBtn');
    if (btn) {
      btn.innerText = '✅ Ya lo anotaste hoy';
      btn.style.background = 'var(--primary-dim, #e0e0e0)';
      btn.style.color = 'var(--text)';
    }

    const newBadges = Achievements.checkAndUnlock();
    if (newBadges.length) {
      newBadges.forEach(badge => this._pushBotMessage(`🎉 ¡Nuevo logro desbloqueado! ${badge.icon} **${badge.name}** — ${badge.desc}`, 'excited'));
      this.renderProfile();
    }
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

    // Historial de compras: cada compra archivada se guarda en localStorage
    // ('nutrio_history'). Acá NO mostramos la lista completa de ítems de
    // cada día (solo una vista previa recortada, para no romper el diseño
    // de la lista); el detalle completo se ve tocando la tarjeta, que abre
    // un modal (ver openPurchaseModal). Guardamos el historial completo en
    // _historialCache para que el modal pueda leerlo por índice.
    let historial = JSON.parse(localStorage.getItem('nutrio_history')) || [];
    this._historialCache = historial;

    html += `<div style="margin-top:25px; border-top:1px dashed #ccc; padding-top:15px;">
              <h4 style="margin-bottom:10px; color:var(--text);">🗃️ Carrito e Historial de Compras</h4>`;

    if (historial.length === 0) {
      html += `<p style="font-size:12px; color:gray;">Aún no guardaste compras. Lo que tildes arriba quedará registrado acá por día.</p>`;
    } else {
      historial.forEach((h, i) => {
        const preview = h.items.slice(0, 4).join(', ') + (h.items.length > 4 ? `… (+${h.items.length - 4} más)` : '');
        html += `<div class="tap-feedback" onclick="UI.openPurchaseModal(${i})"
                  style="background:rgba(0,0,0,0.02); padding:8px; border-radius:6px; margin-bottom:6px; font-size:13px; cursor:pointer;">
                  <b>📅 Día ${h.date}</b> <span style="opacity:0.6;">(${h.items.length} ítem${h.items.length === 1 ? '' : 's'})</span><br>
                  <span style="opacity:0.8;">${preview}</span>
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
    Achievements.trackPurchaseSaved();
    const newBadges = Achievements.checkAndUnlock();
    alert("¡Espectacular! Guardado en tu historial. Los artículos se destildaron para que la lista te quede limpia.");
    this.renderCart();
    if (newBadges.length) {
      newBadges.forEach(badge => this._pushBotMessage(`🎉 ¡Nuevo logro desbloqueado! ${badge.icon} **${badge.name}** — ${badge.desc}`, 'excited'));
      this.renderProfile();
    }
  },

  // --------------------------------------------------------------------
  // Modal de historial de compras: al tocar un día archivado en la lista
  // se abre este modal con el detalle completo (la lista solo muestra una
  // vista previa recortada). El modal se crea una sola vez de forma
  // dinámica, sin depender de nada agregado a mano en index.html.
  // --------------------------------------------------------------------
  _ensurePurchaseModal() {
    if (document.getElementById('purchaseHistoryModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'purchaseHistoryModal';
    overlay.style.cssText = `
      display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5);
      z-index:9999; align-items:center; justify-content:center; padding:20px; box-sizing:border-box;`;
    overlay.onclick = (e) => { if (e.target === overlay) this.closePurchaseModal(); };

    overlay.innerHTML = `
      <div id="purchaseHistoryModalContent" style="
        background:var(--bg, #fff); color:var(--text, #222); border-radius:14px;
        max-width:420px; width:100%; max-height:80vh; overflow-y:auto; padding:18px;
        box-shadow:0 10px 30px rgba(0,0,0,0.25);">
      </div>`;

    document.body.appendChild(overlay);
  },

  // Abre el modal con el detalle completo de la compra archivada en el
  // índice "idx" de _historialCache (el mismo array que arma renderCart()).
  openPurchaseModal(idx) {
    const h = this._historialCache && this._historialCache[idx];
    if (!h) return;
    this._ensurePurchaseModal();

    const content = document.getElementById('purchaseHistoryModalContent');
    const overlay = document.getElementById('purchaseHistoryModal');
    if (!content || !overlay) return;

    const itemsHTML = h.items.map(item => `
      <div style="padding:8px 0; border-bottom:1px solid rgba(0,0,0,0.06);">🛒 ${item}</div>
    `).join('');

    content.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
        <div style="font-weight:bold; font-size:16px;">📅 Compra del ${h.date}</div>
        <button type="button" onclick="UI.closePurchaseModal()" style="background:none; border:none; font-size:18px; cursor:pointer; line-height:1;">✕</button>
      </div>
      <div style="font-size:12px; opacity:0.6; margin-bottom:8px;">${h.items.length} ítem${h.items.length === 1 ? '' : 's'} comprados</div>
      <div>${itemsHTML}</div>
    `;

    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  closePurchaseModal() {
    const overlay = document.getElementById('purchaseHistoryModal');
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
  },

  renderProfile() {
    const profile = StorageApp.getProfile();
    if (!profile) return;
    // Mostramos el apodo si es distinto del nombre real, así se ve que quedó guardado.
    document.getElementById('profileNameDisplay').innerText =
      profile.nickname && profile.nickname !== profile.name
        ? `${profile.name} (te dice "${profile.nickname}")`
        : profile.name;
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

    // Racha: si el HTML tiene un contenedor #streakDisplay lo completamos.
    // Si no existe todavía en index.html, lo creamos dinámicamente arriba
    // de las preferencias para no depender de tocar el HTML a mano.
    let streakEl = document.getElementById('streakDisplay');
    if (!streakEl && prefsEl.parentElement) {
      streakEl = document.createElement('div');
      streakEl.id = 'streakDisplay';
      streakEl.style.cssText = 'margin:12px 0; font-weight:bold; font-size:15px;';
      prefsEl.parentElement.insertBefore(streakEl, prefsEl);
    }
    if (streakEl) {
      streakEl.innerText = `🔥 Racha actual: ${Streak.getCount()} día(s) · Mejor racha: ${Streak.getLongest()} día(s)`;
    }

    // Logros: mismo criterio, usa #achievementsGrid si existe en el HTML,
    // o crea uno debajo de las preferencias.
    let badgesEl = document.getElementById('achievementsGrid');
    if (!badgesEl && prefsEl.parentElement) {
      badgesEl = document.createElement('div');
      badgesEl.id = 'achievementsGrid';
      badgesEl.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px; margin-top:14px;';
      prefsEl.parentElement.appendChild(badgesEl);
    }
    if (badgesEl) {
      const all = Achievements.getAllWithStatus();
      badgesEl.innerHTML = all.map(b => `
        <div class="badge-card ${b.unlocked ? 'unlocked' : 'locked'} tap-feedback" title="${b.desc}"
          style="width:84px; text-align:center; padding:8px 4px; border-radius:10px;
          background:${b.unlocked ? 'var(--primary-dim, #eef7ee)' : 'rgba(0,0,0,0.04)'};
          opacity:${b.unlocked ? '1' : '0.5'};">
          <div style="font-size:24px;">${b.unlocked ? b.icon : '🔒'}</div>
          <div style="font-size:11px; font-weight:bold; margin-top:2px;">${b.name}</div>
        </div>
      `).join('');
    }
  },

  // ----------------------------------------------------------------------
  // Envía un mensaje "de un toque" (usado por los chips del comando
  // "ayuda": Argentina / Barman / Día libre). Mismo patrón que
  // _sendTranscribed: pinta el texto en el input y dispara sendChat(),
  // así el mensaje pasa por exactamente el mismo camino que si el
  // usuario lo hubiera tipeado a mano.
  sendQuickReply(text) {
    const input = document.getElementById('chatInput');
    if (input) {
      input.value = text;
      input.dispatchEvent(new Event('input'));
    }
    this.sendChat();
  },

  // sendChat(): ahora es async porque ChatApp.getBotResponseSmart puede
  // llamar a la IA (Gemini) antes de contestar. Mientras se resuelve, se
  // muestra el indicador de "escribiendo..." (ver _showTypingIndicator).
  // Los botones 👍/👎 solo se pintan cuando response.source === 'reglas',
  // porque ahí sí hay un category/idx real de una variante del motor de
  // reglas para aprender. Cuando la respuesta vino de la IA (source: 'ia')
  // no tiene sentido mostrarlos: solo se pinta el botón de 🔊 escuchar.
  // ----------------------------------------------------------------------
  async sendChat() {
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

    NutrioAvatar.happy();

    input.value = '';
    input.style.height = 'auto';

    // Si estamos esperando que el usuario liste los ingredientes que tiene
    // (después de abrir el picker con 🥕), este mensaje se interpreta como
    // esa lista (separada por coma) en vez de pasar por las reglas normales
    // del chat.
    if (ChatApp._awaitingIngredients) {
      const list = msg.split(',').map(s => s.trim()).filter(Boolean);
      setTimeout(() => this._resolveIngredientSearch(list), 350);
      return;
    }

    // Chiquito delay antes de mostrar "escribiendo...", para que no se vea
    // como un parpadeo instantáneo en respuestas súper rápidas. Guardamos
    // el id del timeout para poder cancelarlo si la respuesta ya llegó
    // antes de que se cumplan los 150ms (si no, el indicador se terminaba
    // pintando DESPUÉS de la respuesta y se quedaba colgado en pantalla).
    const typingTimeoutId = setTimeout(() => this._showTypingIndicator(), 150);
    NutrioAvatar.thinking();

    try {
      const profile = StorageApp.getProfile();
      const response = await ChatApp.getBotResponseSmart(msg, profile);
      clearTimeout(typingTimeoutId);
      this._hideTypingIndicator();
      NutrioAvatar.happy();

      const msgId = 'chatmsg_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      const botTime = new Date();
      this._chatTextRefs[msgId] = response.text;

      const feedbackButtonsHTML = response.source === 'reglas'
        ? `<button type="button" data-role="like" title="Me gusta" onclick="UI.rateResponse('${msgId}', '${response.category}', ${response.idx}, true)">👍</button>
           <button type="button" data-role="dislike" title="No me gusta" onclick="UI.rateResponse('${msgId}', '${response.category}', ${response.idx}, false)">👎</button>`
        : '';

      if (scroll) {
        scroll.innerHTML += `
          <div class="msg-row bot" id="${msgId}">
            <div class="msg-wrap">
              <div class="msg-bubble bot" id="${msgId}_bubble"></div>
              <div class="msg-time">${this._formatTime(botTime)}</div>
              <div class="chat-feedback" id="${msgId}_feedback" style="opacity:0; transition:opacity .2s ease;">
                <button type="button" data-role="speak" title="Escuchar" onclick="UI.speakMessage('${msgId}')">🔊</button>
                ${feedbackButtonsHTML}
              </div>
            </div>
          </div>`;
        scroll.scrollTop = scroll.scrollHeight;
      }

      if (Speech.enabled) Speech.speak(response.text);

      // Efecto de escritura letra por letra: la bubble se pinta vacía
      // arriba y acá se va revelando de a poco. Los botones de feedback
      // (👍👎🔊) aparecen recién cuando terminó de "escribir", para que no
      // queden clickeables sobre un mensaje a medio pintar.
      if (scroll) {
        const bubble = document.getElementById(`${msgId}_bubble`);
        await this._typeWriterEffect(bubble, response.text, () => {
          scroll.scrollTop = scroll.scrollHeight;
        });
        const feedbackEl = document.getElementById(`${msgId}_feedback`);
        if (feedbackEl) feedbackEl.style.opacity = '1';
      }
    } catch (err) {
      // Red de seguridad extra: si algo inesperado explota acá (no debería,
      // porque getBotResponseSmart nunca rechaza su promesa), no dejamos el
      // indicador de "escribiendo..." colgado para siempre.
      clearTimeout(typingTimeoutId);
      this._hideTypingIndicator();
      console.error('NutrIO: error inesperado en sendChat', err);
    }
  },

  // Guarda si al usuario le gustó o no una respuesta puntual del bot.
  // Esto hace que ChatApp deje de repetir las variantes marcadas con 👎
  // (y priorice, dentro de lo posible, las que tuvieron 👍). Solo se llama
  // para respuestas del motor de reglas (ver feedbackButtonsHTML en sendChat).
  rateResponse(msgId, category, idx, liked) {
    ChatApp.recordFeedback(category, idx, liked);

    const container = document.getElementById(msgId);
    if (!container) return;
    const likeBtn = container.querySelector('[data-role="like"]');
    const dislikeBtn = container.querySelector('[data-role="dislike"]');
    if (likeBtn) likeBtn.classList.toggle('active', liked);
    if (dislikeBtn) dislikeBtn.classList.toggle('active', !liked);

    // Feedback visual: 👍 tira una explosión de papelitos de color desde el
    // botón (y el avatar se agranda y se ríe); 👎 hace que el avatar se
    // caiga y se ponga a llorar. Todo queda contenido dentro del área
    // visible de #chatScroll (no tapa el resto de la app).
    if (liked) {
      this._confettiBurst(likeBtn);
      NutrioAvatar.laugh();
    } else {
      NutrioAvatar.cryFall();
    }
  },

  // ======================================================================
  // EFECTOS VISUALES DE FEEDBACK DEL CHAT (👍 papelitos de colores)
  //
  // Crea un overlay temporal (position:fixed) del mismo tamaño y posición
  // que #chatScroll en pantalla, le inserta partículas animadas con CSS,
  // y se auto-elimina al terminar la animación. No depende de la
  // estructura del HTML de afuera: solo necesita que exista #chatScroll.
  // ======================================================================
  _ensureChatFxStyles() {
    if (document.getElementById('chatFxStyles')) return;
    const style = document.createElement('style');
    style.id = 'chatFxStyles';
    style.textContent = `
      .chat-fx-overlay { position: fixed; pointer-events: none; overflow: hidden; z-index: 9999; }
      .confetti-piece {
        position: absolute;
        border-radius: 2px;
        transform: translate(-50%, -50%) rotate(0deg);
        animation: confetti-fly 1.1s cubic-bezier(.25,.75,.4,1) forwards;
      }
      @keyframes confetti-fly {
        0%   { transform: translate(-50%, -50%) rotate(0deg); opacity: 1; }
        100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  },

  _makeChatFxOverlay() {
    const scroll = document.getElementById('chatScroll');
    if (!scroll) return null;
    this._ensureChatFxStyles();

    const rect = scroll.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'chat-fx-overlay';
    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    document.body.appendChild(overlay);
    return { overlay, rect };
  },

  _confettiBurst(originEl) {
    const fx = this._makeChatFxOverlay();
    if (!fx) return;
    const { overlay, rect } = fx;

    let originX = rect.width / 2;
    let originY = rect.height / 2;
    if (originEl && originEl.getBoundingClientRect) {
      const oRect = originEl.getBoundingClientRect();
      originX = oRect.left + oRect.width / 2 - rect.left;
      originY = oRect.top + oRect.height / 2 - rect.top;
    }

    const COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#5f27cd', '#ff9ff3', '#54a0ff'];
    const PIECES = 160;
    for (let i = 0; i < PIECES; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';

      const angle = Math.random() * Math.PI * 2;
      const distance = 70 + Math.random() * 220;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 50; // sesgo hacia arriba, como explosión

      piece.style.left = originX + 'px';
      piece.style.top = originY + 'px';
      piece.style.setProperty('--dx', dx + 'px');
      piece.style.setProperty('--dy', dy + 'px');
      piece.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size = 5 + Math.random() * 6;
      piece.style.width = size + 'px';
      piece.style.height = (size * 0.45) + 'px';
      piece.style.animationDelay = (Math.random() * 0.2) + 's';

      overlay.appendChild(piece);
    }

    setTimeout(() => overlay.remove(), 1500);
  },

  // ======================================================================
  // BÚSQUEDA POR INGREDIENTES → SUGERENCIA DE RECETAS (100% local, sin API)
  //
  // Se abre con el botón 🥕: muestra chips armados con TU LISTA DE
  // SUPERMERCADO (carrito), ya filtrada de condimentos/especias, o con los
  // ingredientes más comunes de la base si el carrito está vacío. El
  // usuario toca los que tiene (o escribe otros) y con esa lista se arman
  // sugerencias reales de recetas, respetando alergias/restricciones del perfil.
  // ======================================================================
  openIngredientPicker() {
    const scroll = document.getElementById('chatScroll');
    if (!scroll) return;

    ChatApp._awaitingIngredients = true;
    ChatApp._pendingIngredients = [];

    let known = ChatApp._getCartIngredientsFiltered();
    if (!known.length) known = ChatApp._getKnownIngredients();

    const now = new Date();
    const chipsHTML = known.map(ing => {
      const safe = ing.replace(/'/g, "\\'");
      return `<span class="chip-sm tap-feedback" data-ing="${ing}" onclick="UI.toggleIngredientChip(this, '${safe}')">${ing}</span>`;
    }).join('');

    const bodyHTML = known.length
      ? `Tocá los ingredientes que tenés a mano (podés elegir varios):
         <div class="ingredient-picker-chips" id="ingredientPickerChips">${chipsHTML}</div>
         <input type="text" id="extraIngredientsInput" placeholder="¿Algo más? Separá con coma" style="width:100%; margin-top:10px; padding:8px; border-radius:8px; border:1px solid #ddd; box-sizing:border-box;">
         <button type="button" onclick="UI.confirmIngredientSearch()" style="width:100%; margin-top:10px; padding:10px; border:none; border-radius:8px; font-weight:bold; cursor:pointer; background:var(--primary); color:white;">Buscar recetas</button>`
      : `Todavía no tengo ingredientes para sugerirte (armá primero tu lista de supermercado en el Carrito). Escribime acá los que tengas, separados por coma, y te busco recetas.`;

    scroll.innerHTML += `
      <div class="msg-row bot">
        <div class="msg-wrap">
          <div class="msg-bubble bot">${bodyHTML}</div>
          <div class="msg-time">${this._formatTime(now)}</div>
        </div>
      </div>`;
    scroll.scrollTop = scroll.scrollHeight;
  },

  toggleIngredientChip(el, val) {
    el.classList.toggle('active');
    const idx = ChatApp._pendingIngredients.indexOf(val);
    if (el.classList.contains('active') && idx === -1) {
      ChatApp._pendingIngredients.push(val);
    } else if (!el.classList.contains('active') && idx !== -1) {
      ChatApp._pendingIngredients.splice(idx, 1);
    }
  },

  confirmIngredientSearch() {
    const extraInput = document.getElementById('extraIngredientsInput');
    let extra = [];
    if (extraInput && extraInput.value.trim()) {
      extra = extraInput.value.split(',').map(s => s.trim()).filter(Boolean);
    }
    const all = [...ChatApp._pendingIngredients, ...extra];
    this._resolveIngredientSearch(all);
  },

  _resolveIngredientSearch(ingredientsArr) {
    ChatApp._awaitingIngredients = false;
    const scroll = document.getElementById('chatScroll');
    const now = new Date();

    if (!ingredientsArr.length) {
      if (scroll) {
        scroll.innerHTML += `
          <div class="msg-row bot">
            <div class="msg-wrap">
              <div class="msg-bubble bot">Necesito al menos un ingrediente para buscarte algo. Tocá algún chip de arriba o escribime uno. 🙂</div>
              <div class="msg-time">${this._formatTime(now)}</div>
            </div>
          </div>`;
        scroll.scrollTop = scroll.scrollHeight;
      }
      ChatApp._awaitingIngredients = true; // seguimos esperando la lista
      return;
    }

    if (scroll) {
      scroll.innerHTML += `
        <div class="msg-row user">
          <div class="msg-wrap">
            <div class="msg-bubble user">Tengo: ${ingredientsArr.join(', ')}</div>
            <div class="msg-time">${this._formatTime(now)}</div>
          </div>
        </div>`;
      scroll.scrollTop = scroll.scrollHeight;
    }

    setTimeout(() => {
      const profile = StorageApp.getProfile();
      const matches = ChatApp.matchRecipesByIngredients(ingredientsArr, profile);
      const msgId = 'chatmsg_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      const botNow = new Date();

      let bodyHTML, speakText;
      if (matches.length) {
        bodyHTML = `Con eso te puedo armar esto (ordenado por lo que más se ajusta a lo que tenés):${this._buildChatRecipeCardsHTML(matches)}`;
        speakText = `Con eso te puedo armar: ${matches.map(m => m.name).join(', ')}.`;
      } else {
        bodyHTML = `No encontré recetas que usen esos ingredientes en tu base todavía. Probá con otros ingredientes, o mirá el menú completo en <b>Inicio</b> o <b>Semana</b>.`;
        speakText = 'No encontré recetas que usen esos ingredientes todavía. Probá con otros, o mirá el menú completo en Inicio o Semana.';
      }
      this._chatTextRefs[msgId] = speakText;

      if (scroll) {
        scroll.innerHTML += `
          <div class="msg-row bot" id="${msgId}">
            <div class="msg-wrap">
              <div class="msg-bubble bot">${bodyHTML}</div>
              <div class="msg-time">${this._formatTime(botNow)}</div>
              <div class="chat-feedback">
                <button type="button" data-role="speak" title="Escuchar" onclick="UI.speakMessage('${msgId}')">🔊</button>
              </div>
            </div>
          </div>`;
        scroll.scrollTop = scroll.scrollHeight;
      }

      if (Speech.enabled) Speech.speak(speakText);
    }, 400);
  },

  // Tarjetas compactas de recetas sugeridas, insertadas dentro de la burbuja del chat.
  _buildChatRecipeCardsHTML(recipes) {
    if (!recipes.length) return '';
    return `<div class="chat-recipe-results">` + recipes.map((r, i) => {
      const refId = 'chatmatch-' + Date.now() + '-' + i;
      this._registerRecipeRef(refId, r, r.category || 'almuerzo', null);
      const ing = (r.ingredients || []).join(', ');
      return `
        <div class="chat-recipe-mini tap-feedback" onclick="UI.openRecipeModalByRef('${refId}')">
          <div class="mini-top">
            <span class="mini-name">${r.name || ''}</span>
            <span class="mini-kcal">${r.kcal || '—'} kcal</span>
          </div>
          <div class="mini-ing">${ing}</div>
        </div>`;
    }).join('') + `</div>`;
  },

  resetAll() {
    StorageApp.clearAll();
    location.reload();
  }
};

// ==========================================================================
// MÓDULO DE CHAT (única declaración global, sin duplicados)
//
// NOTA DE DISEÑO: el chat YA NO usa MealEngine.getMealForDate() ni
// MealEngine.getDrinkSuggestion() para responder — esas funciones son
// determinísticas por fecha (por eso Inicio y Semana siempre muestran lo
// mismo el mismo día). En cambio, el chat arma su propio pool filtrado
// (reutilizando MealEngine.filterRecipesForProfile / refineByKcal, que sí
// respetan alergias/restricciones/salud) y elige al azar dentro de ese
// pool cada vez, evitando repetir la última opción mostrada EN EL CHAT.
// Esto le da variedad real e independiente de lo que ya viste en Inicio
// o en el Plan Semanal, tanto para comida como para bebidas.
// ==========================================================================
window.ChatApp = {

  // Guarda el último índice mostrado por categoría, para no repetir dos veces seguidas.
  _lastVariantByCategory: {},

  // Última receta y última bebida mostradas EN EL CHAT, por categoría real
  // de datos (desayuno/almuerzo/meriendas/cena), para no repetir la misma
  // dos veces seguidas cuando se pregunta de nuevo.
  _lastChatRecipe: {},
  // Últimos ids (hasta 3) mostrados por categoría cuando se piden varias
  // recetas de una — evita repetir la misma tanda dos veces seguidas.
  _lastChatRecipes: {},
  _lastChatDrink: {},

  // Recuerda si lo último que se le ofreció al usuario fue comida o bebida,
  // para saber a qué se refiere un "dame otra opción" genérico.
  _lastTopic: null,

  // true mientras el chat está esperando que el usuario confirme los
  // ingredientes que tiene a mano (ver UI.openIngredientPicker).
  _awaitingIngredients: false,
  _pendingIngredients: [],
  __knownIngredientsCache: null,

  // Modo barman: mientras está activo, cada mensaje del usuario (salvo el
  // de salida) recibe un trago/cóctel nuevo, en vez de pasar por el resto
  // de las reglas de comida. _lastCocktail evita repetir el mismo dos veces seguidas.
  _barmanMode: false,
  _lastCocktail: null,

  // Última receta "argentina" mostrada en el chat, para no repetir la misma
  // dos veces seguidas cuando se pide "otra receta argentina".
  _lastArgentina: null,

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

  // Si el usuario pidió una comida puntual por su nombre ("qué puedo
  // cenar", "qué almuerzo", etc.), devolvemos esa franja aunque no sea la
  // hora real. Si no menciona ninguna en particular, caemos a la franja
  // horaria actual (_getMealSlot).
  _getRequestedSlot(msg) {
    if (msg.includes('cenar') || msg.includes('para la cena') || msg.includes('que ceno')) return { key: 'cena', label: 'Cena' };
    if (msg.includes('almorzar') || msg.includes('para el almuerzo') || msg.includes('que almuerzo')) return { key: 'almuerzo', label: 'Almuerzo' };
    if (msg.includes('desayunar') || msg.includes('para el desayuno') || msg.includes('que desayuno')) return { key: 'desayuno', label: 'Desayuno' };
    if (msg.includes('merendar') || msg.includes('para la merienda') || msg.includes('que meriendo')) return { key: 'merienda', label: 'Merienda' };
    return this._getMealSlot();
  },

  // --------------------------------------------------------------------
  // RECETAS ARGENTINAS: filtra el pool normal (ya respeta alergias,
  // restricciones y condiciones de salud vía MealEngine.filterRecipesForProfile)
  // quedándose solo con las que "suenan" a comida argentina.
  //
  // Si en data.js le agregás a una receta un campo `pais: 'argentina'` (o
  // `origen: 'argentina'`, o un array `tags` que incluya 'argentina'), eso
  // se usa primero y es 100% preciso. Si la receta no tiene ese campo,
  // caemos a esta lista de palabras clave típicas como heurística (por
  // nombre e ingredientes) — no es perfecta, pero anda bien sin tener que
  // tocar toda la base de datos a mano.
  // --------------------------------------------------------------------
  _ARGENTINE_KEYWORDS: [
    'asado', 'milanesa', 'empanada', 'locro', 'choripan', 'chori pan',
    'matambre', 'provoleta', 'humita', 'pastel de papa', 'bife de chorizo',
    'vacio', 'guiso criollo', 'puchero', 'noquis del 29',
    'tortilla de papas', 'canelones', 'ravioles', 'chimichurri',
    'medialunas', 'facturas', 'dulce de leche', 'alfajor', 'mate',
    'chinchulin', 'morcilla', 'achuras', 'sorrentinos',
    'bondiola', 'carbonada', 'estofado criollo'
  ],

  _esRecetaArgentina(recipe) {
    if (!recipe) return false;

    // 1) Campo explícito en data.js, si existe (más preciso que adivinar).
    const camposPosibles = [recipe.pais, recipe.origen, recipe.country];
    if (camposPosibles.some(v => v && this._normalize(String(v)) === 'argentina')) return true;
    if (Array.isArray(recipe.tags) && recipe.tags.some(t => {
      const tt = this._normalize(String(t));
      return tt === 'argentina' || tt === 'argentino';
    })) return true;

    // 2) Heurística por nombre + ingredientes.
    const texto = this._normalize(
      recipe.name + ' ' + (Array.isArray(recipe.ingredients) ? recipe.ingredients.join(' ') : '')
    );
    return this._ARGENTINE_KEYWORDS.some(k => texto.includes(k));
  },

  // Igual que _getRandomRecipeForSlot, pero restringido a recetas argentinas
  // (ver _esRecetaArgentina). Devuelve null si no encuentra ninguna para
  // esa franja dentro de lo que el perfil puede comer.
  _getRandomArgentineRecipeForSlot(slotKey, profile, forceCheatDay) {
    if (typeof MealEngine === 'undefined' || typeof RECIPES_DB === 'undefined') return null;
    const category = SLOT_TO_CATEGORY[slotKey] || 'meriendas';

    const isSunday = forceCheatDay !== undefined ? forceCheatDay : MealEngine.isCheatDay(new Date());
    let pool = MealEngine.filterRecipesForProfile(category, profile, isSunday) || [];
    pool = pool.filter(r => this._esRecetaArgentina(r));
    if (!pool.length) return null;

    let choices = pool;
    if (pool.length > 1 && this._lastArgentina) {
      const withoutLast = pool.filter(r => r.id !== this._lastArgentina);
      if (withoutLast.length) choices = withoutLast;
    }

    const pick = choices[Math.floor(Math.random() * choices.length)];
    this._lastArgentina = pick.id;
    return pick;
  },

  // Arma la respuesta del chat para "quiero una receta argentina".
  _respondArgentina(profile) {
    const slot = this._getMealSlot();
    const recipe = this._getRandomArgentineRecipeForSlot(slot.key, profile);
    this._lastTopic = 'comida';

    if (!recipe) {
      return this.pickVariant('argentina_sin_receta', [
        `Che, para ${slot.label.toLowerCase()} no tengo ninguna receta bien argenta cargada que te calce con tu perfil ahora mismo. Fijate en Inicio o Semana, o pedime "qué puedo comer" para una opción normal. 🇦🇷`
      ]);
    }

    const ing = recipe.ingredients ? recipe.ingredients.join(', ') : '';
    return this.pickVariant('argentina', [
      (r, i) => `¡Dale, receta bien argenta! 🇦🇷 Para ${slot.label.toLowerCase()} te tiro: **${r.name}** (${r.kcal} kcal) con ${i}. Si querés otra, pedime "otra receta argentina". 🔄`,
      (r, i) => `Va esta, bien nuestra 🇦🇷: **${r.name}** (${r.kcal} kcal), con ${i}. ¿Te copa o probamos otra?`
    ], recipe, ing);
  },

  // --------------------------------------------------------------------
  // VARIEDAD DE COMIDA: arma el pool filtrado (respeta alergias, dislikes,
  // restricciones y condiciones de salud vía MealEngine.filterRecipesForProfile)
  // y elige una receta al azar, evitando repetir la última mostrada en el chat.
  // --------------------------------------------------------------------
  _getRandomRecipeForSlot(slotKey, profile, forceCheatDay) {
    if (typeof MealEngine === 'undefined' || typeof RECIPES_DB === 'undefined') return null;
    const category = SLOT_TO_CATEGORY[slotKey] || 'meriendas';

    const isSunday = forceCheatDay !== undefined ? forceCheatDay : MealEngine.isCheatDay(new Date());
    let pool = MealEngine.filterRecipesForProfile(category, profile, isSunday);
    pool = MealEngine.refineByKcal(pool, profile, category);
    if (!pool.length) pool = getRecipesByCategory(category);
    if (!pool.length) return null;

    const lastId = this._lastChatRecipe[category];
    let choices = pool;
    if (pool.length > 1 && lastId) {
      const withoutLast = pool.filter(r => r.id !== lastId);
      if (withoutLast.length) choices = withoutLast;
    }

    const pick = choices[Math.floor(Math.random() * choices.length)];
    this._lastChatRecipe[category] = pick.id;
    return pick;
  },

  // --------------------------------------------------------------------
  // VARIEDAD DE COMIDA (VARIAS A LA VEZ): igual que la de arriba, pero
  // devuelve hasta "count" recetas distintas del pool filtrado, evitando
  // repetir la última tanda mostrada en el chat para esa categoría cuando
  // hay suficientes opciones para no repetir.
  // --------------------------------------------------------------------
  _getRandomRecipesForSlot(slotKey, profile, count, forceCheatDay) {
    if (typeof MealEngine === 'undefined' || typeof RECIPES_DB === 'undefined') return [];
    const category = SLOT_TO_CATEGORY[slotKey] || 'meriendas';

    const isSunday = forceCheatDay !== undefined ? forceCheatDay : MealEngine.isCheatDay(new Date());
    let pool = MealEngine.filterRecipesForProfile(category, profile, isSunday);
    pool = MealEngine.refineByKcal(pool, profile, category);
    if (!pool.length) pool = getRecipesByCategory(category);
    if (!pool.length) return [];

    const lastIds = this._lastChatRecipes[category] || [];
    let choices = pool;
    if (pool.length > count) {
      const withoutLast = pool.filter(r => !lastIds.includes(r.id));
      if (withoutLast.length >= count) choices = withoutLast;
    }

    const shuffled = [...choices].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, Math.min(count, shuffled.length));

    this._lastChatRecipes[category] = picked.map(r => r.id);
    return picked;
  },

  // --------------------------------------------------------------------
  // VARIEDAD DE BEBIDA: elige al azar dentro de BEBIDAS_DB[category], en vez
  // de usar la variante fija-por-día de MealEngine.getDrinkSuggestion().
  // La opción con alcohol solo aparece los domingos (día permitido), igual
  // que en el resto de la app. Evita repetir la última bebida sin alcohol
  // mostrada en el chat para esa categoría.
  // --------------------------------------------------------------------
  _getRandomDrinkForSlot(slotKey, profile, forceCheatDay) {
    if (typeof BEBIDAS_DB === 'undefined' || typeof MealEngine === 'undefined') return null;
    const category = SLOT_TO_CATEGORY[slotKey] || 'meriendas';
    const options = BEBIDAS_DB[category] || BEBIDAS_DB.almuerzo;
    if (!options) return null;

    const isSunday = forceCheatDay !== undefined ? forceCheatDay : MealEngine.isCheatDay(new Date());

    let sinOpciones = options.sinAlcohol || [];
    const lastSin = this._lastChatDrink[category];
    let sinChoices = sinOpciones;
    if (sinOpciones.length > 1 && lastSin) {
      const withoutLast = sinOpciones.filter(d => d !== lastSin);
      if (withoutLast.length) sinChoices = withoutLast;
    }
    const sinAlcohol = sinChoices.length
      ? sinChoices[Math.floor(Math.random() * sinChoices.length)]
      : null;
    if (sinAlcohol) this._lastChatDrink[category] = sinAlcohol;

    let conAlcohol = null;
    if (isSunday && options.conAlcohol && options.conAlcohol.length) {
      conAlcohol = options.conAlcohol[Math.floor(Math.random() * options.conAlcohol.length)];
    }

    return { sinAlcohol, conAlcohol, alcoholPermitido: isSunday };
  },

  // --------------------------------------------------------------------
  // SUGERENCIA POR INGREDIENTES DISPONIBLES (100% local)
  // --------------------------------------------------------------------

  // Palabras que identifican condimentos, especias, líquidos base o aditivos:
  // se descartan de los chips porque no son algo que alguien tenga que
  // "elegir" al armar una receta, y ensucian la lista (aparecen en casi
  // todas las recetas, así que sin este filtro le ganan el lugar a cosas
  // como carne o zanahoria).
  _CONDIMENT_KEYWORDS: [
    'sal', 'pimienta', 'aceite', 'oliva', 'vinagre', 'azucar', 'edulcorante',
    'oregano', 'comino', 'laurel', 'perejil', 'cilantro', 'pimenton', 'canela',
    'nuez moscada', 'curry', 'mostaza', 'mayonesa', 'ketchup', 'salsa de soja',
    'caldo', 'esencia', 'extracto', 'polvo de hornear', 'levadura', 'bicarbonato',
    'agua', 'hielo', 'condimento', 'especias', 'colorante', 'jugo de limon',
    'vainilla', 'romero', 'tomillo', 'albahaca seca'
  ],

  // Categorías usadas para garantizar variedad real en los chips (en vez de
  // que la lista quede dominada por lo que más se repite en las recetas).
  _INGREDIENT_CATEGORIES: {
    proteinas: ['carne', 'pollo', 'pechuga', 'pescado', 'atun', 'salmon', 'cerdo', 'huevo', 'lomo', 'pavo', 'merluza', 'garbanzo', 'lenteja', 'poroto', 'tofu', 'jamon', 'panceta', 'chorizo', 'camaron', 'langostino', 'bife', 'milanesa'],
    vegetales: ['zanahoria', 'tomate', 'lechuga', 'papa', 'batata', 'calabaza', 'zapallo', 'brocoli', 'espinaca', 'pepino', 'morron', 'pimiento', 'choclo', 'remolacha', 'apio', 'coliflor', 'berenjena', 'cebolla', 'ajo', 'rucula', 'repollo', 'acelga', 'chaucha', 'hongo', 'champinon'],
    frutas: ['manzana', 'banana', 'naranja', 'frutilla', 'pera', 'uva', 'limon', 'palta', 'mango', 'anana', 'durazno', 'kiwi', 'ciruela', 'sandia', 'melon', 'mandarina'],
    carbohidratos: ['arroz', 'fideo', 'pasta', 'pan', 'avena', 'quinoa', 'harina', 'tortilla', 'polenta', 'fecula', 'galleta'],
    lacteos: ['queso', 'leche', 'yogur', 'crema', 'manteca', 'ricota']
  },

  _stripAccents(str) {
    return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  // Junta los ingredientes únicos de toda RECIPES_DB, descarta condimentos
  // y especias, y arma la lista de chips balanceando categorías (proteínas,
  // vegetales, frutas, carbohidratos, lácteos) para que haya variedad real
  // en vez de que unos pocos ingredientes muy repetidos ocupen todo el lugar.
  //
  // Esta lista es un RESPALDO (fallback) para cuando el usuario todavía no
  // armó su lista de supermercado (carrito). Si el carrito tiene datos, el
  // picker de ingredientes usa _getCartIngredientsFiltered() en su lugar.
  _getKnownIngredients() {
    if (this.__knownIngredientsCache) return this.__knownIngredientsCache;
    if (typeof RECIPES_DB === 'undefined') return [];

    const counts = {};
    RECIPES_DB.forEach(r => {
      (r.ingredients || []).forEach(ing => {
        const key = (ing || '').trim();
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
      });
    });

    const candidates = Object.keys(counts).filter(ing => {
      const norm = this._stripAccents(ing);
      return !this._CONDIMENT_KEYWORDS.some(kw => norm.includes(kw));
    });

    const classify = (ing) => {
      const norm = this._stripAccents(ing);
      for (const [cat, keywords] of Object.entries(this._INGREDIENT_CATEGORIES)) {
        if (keywords.some(kw => norm.includes(kw))) return cat;
      }
      return 'otros';
    };

    const buckets = { proteinas: [], vegetales: [], carbohidratos: [], lacteos: [], frutas: [], otros: [] };
    candidates.forEach(ing => buckets[classify(ing)].push(ing));

    Object.keys(buckets).forEach(cat => {
      buckets[cat].sort((a, b) => counts[b] - counts[a]);
    });

    // Límites por categoría: priorizamos proteínas y vegetales (lo más
    // "reconocible" al armar la lista), sin dejar afuera frutas/carbohidratos/lácteos.
    const limits = { proteinas: 14, vegetales: 14, carbohidratos: 8, lacteos: 6, frutas: 8, otros: 6 };
    let known = [];
    Object.keys(limits).forEach(cat => {
      known = known.concat(buckets[cat].slice(0, limits[cat]));
    });

    this.__knownIngredientsCache = known;
    return known;
  },

  // Toma la lista de supermercado (carrito) del usuario y descarta condimentos,
  // especias y aditivos, reutilizando las mismas keywords/categorías que ya
  // usamos para RECIPES_DB. Se recalcula siempre (no se cachea) porque el
  // carrito puede cambiar en cualquier momento durante la sesión (se tilda,
  // se archiva la compra, etc.).
  _getCartIngredientsFiltered() {
    if (typeof StorageApp === 'undefined') return [];
    const cart = StorageApp.getCart() || [];
    if (!cart.length) return [];

    const filtered = cart.filter(ing => {
      const norm = this._stripAccents(ing);
      return !this._CONDIMENT_KEYWORDS.some(kw => norm.includes(kw));
    });

    const classify = (ing) => {
      const norm = this._stripAccents(ing);
      for (const [cat, keywords] of Object.entries(this._INGREDIENT_CATEGORIES)) {
        if (keywords.some(kw => norm.includes(kw))) return cat;
      }
      return 'otros';
    };

    const order = ['proteinas', 'vegetales', 'frutas', 'carbohidratos', 'lacteos', 'otros'];
    const buckets = { proteinas: [], vegetales: [], frutas: [], carbohidratos: [], lacteos: [], otros: [] };
    filtered.forEach(ing => buckets[classify(ing)].push(ing));

    let result = [];
    order.forEach(cat => { result = result.concat(buckets[cat]); });
    return result;
  },

  // Junta el pool de recetas ya filtrado por perfil (alergias, restricciones,
  // condiciones de salud) para las 4 categorías, deduplicado por id.
  _getProfileFilteredPool(profile) {
    const categories = ['desayuno', 'almuerzo', 'meriendas', 'cena'];
    const seen = new Set();
    const pool = [];

    categories.forEach(cat => {
      let list = [];
      if (typeof MealEngine !== 'undefined' && MealEngine.filterRecipesForProfile) {
        list = MealEngine.filterRecipesForProfile(cat, profile, false) || [];
      } else if (typeof getRecipesByCategory === 'function') {
        list = getRecipesByCategory(cat) || [];
      }
      list.forEach(r => {
        if (r && r.id !== undefined && !seen.has(r.id)) {
          seen.add(r.id);
          pool.push(r);
        }
      });
    });

    if (!pool.length && typeof RECIPES_DB !== 'undefined') return RECIPES_DB;
    return pool;
  },

  // Ordena las recetas del pool filtrado según cuántos de los ingredientes
  // pedidos aparecen en cada una (match parcial e insensible a mayúsculas),
  // y devuelve las 5 con más coincidencias.
  matchRecipesByIngredients(ingredientsArr, profile) {
    if (!ingredientsArr || !ingredientsArr.length) return [];
    const pool = this._getProfileFilteredPool(profile);
    if (!pool.length) return [];

    const wanted = ingredientsArr.map(i => i.toLowerCase().trim()).filter(Boolean);

    const scored = pool.map(r => {
      const ing = (r.ingredients || []).map(i => i.toLowerCase());
      let score = 0;
      wanted.forEach(w => {
        if (ing.some(i => i.includes(w) || w.includes(i))) score++;
      });
      return { recipe: r, score };
    }).filter(x => x.score > 0);

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5).map(x => x.recipe);
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

  // --------------------------------------------------------------------
  // MODO BARMAN: junta todas las opciones "conAlcohol" de BEBIDAS_DB
  // (de todas las franjas: desayuno, almuerzo, meriendas, cena) en un
  // único pool de tragos/cócteles, sin repetir el desayuno/almuerzo/etc.
  // Así no hace falta cargar una base de datos nueva para esto.
  // --------------------------------------------------------------------
  _getAllCocktails() {
    if (typeof BEBIDAS_DB === 'undefined') return [];
    const set = new Set();
    Object.values(BEBIDAS_DB).forEach(opt => {
      if (opt && Array.isArray(opt.conAlcohol)) {
        opt.conAlcohol.forEach(c => set.add(c));
      }
    });
    return Array.from(set);
  },

  _getRandomCocktail() {
    const pool = this._getAllCocktails();
    if (!pool.length) return null;

    let choices = pool;
    if (pool.length > 1 && this._lastCocktail) {
      const withoutLast = pool.filter(c => c !== this._lastCocktail);
      if (withoutLast.length) choices = withoutLast;
    }
    const pick = choices[Math.floor(Math.random() * choices.length)];
    this._lastCocktail = pick;
    return pick;
  },

  // isFirstTime=true solo para el mensaje de bienvenida al activar el modo.
  _respondBarman(isFirstTime) {
    const cocktail = this._getRandomCocktail();
    if (!cocktail) {
      return this.pickVariant('barman_sin_datos', [
        `Activé el modo barman 🍸, pero todavía no tengo tragos cargados en la base (BEBIDAS_DB necesita opciones "conAlcohol"). Cargalas en data.js y probamos de nuevo.`
      ]);
    }
    if (isFirstTime) {
      return this.pickVariant('barman_activado', [
        (c) => `¡Modo barman activado! 🍸 Arrancamos con: **${c}**. Pedime "otro trago" cuando quieras otro, o decime "salir del barman" para volver a hablar de comida.`,
        (c) => `🍹 Barra abierta. Primer trago de la noche: **${c}**. Seguí pidiendo cuando quieras, y decime "salir del barman" para cortar.`
      ], cocktail);
    }
    return this.pickVariant('barman_otro', [
      (c) => `Va este: **${c}** 🍸. ¿Otro? Pedime nomás, o decime "salir del barman" para volver a las comidas.`,
      (c) => `Ahí tenés: **${c}** 🍹. Seguimos si querés más, o "salir del barman" cuando quieras parar.`
    ], cocktail);
  },

  getBotResponse(userMessage, profile) {
    const msg = this._normalize(userMessage);
    // Usamos el apodo (o "cómo querés que te llame") si lo cargó en el
    // onboarding; si no, caemos al nombre real del perfil.
    const displayName = profile && (profile.nickname || profile.name);
    const name = displayName ? ` ${displayName}` : ' che';

    // --- Modo barman activo: intercepta TODO antes que el resto de las reglas ---
    if (this._barmanMode) {
      const quiereSalirBarman =
        msg.includes('salir') || msg.includes('modo normal') ||
        msg.includes('volver a nutri') || msg.includes('chau barman') ||
        msg.includes('desactiva barman') || msg.includes('apagar barman') ||
        msg.includes('basta de tragos');

      if (quiereSalirBarman) {
        this._barmanMode = false;
        return this.pickVariant('barman_salir', [
          `Listo, guardo la coctelera 🍸 y vuelvo a mi rol de nutricionista. ¿Qué necesitás?`,
          `Dale, cerramos la barra por hoy. Volvemos al modo comida saludable. 😄`
        ]);
      }

      return this._respondBarman(false);
    }

    // --- Activar modo barman ---
    const activaBarman =
      msg.includes('modo barman') ||
      msg.includes('modo bartender') ||
      msg.includes('activa barman') ||
      msg.includes('activar barman') ||
      msg.includes('quiero un coctel') ||
      msg.includes('dame un trago') ||
      msg.includes('quiero un trago');

    if (activaBarman) {
      this._barmanMode = true;
      this._lastTopic = 'bebida';
      return this._respondBarman(true);
    }

    // --- Comando "ayuda": muestra chips tocables con los modos/comandos
    // especiales del chat (recetas argentinas, modo barman, día libre).
    // Al tocar un chip se manda ese mismo mensaje como si el usuario lo
    // hubiera escrito (ver UI.sendQuickReply en app.js).
    const pideAyuda =
      msg === 'ayuda' ||
      msg === 'help' ||
      msg.includes('menu de ayuda') ||
      msg.includes('que podes hacer') ||
      msg.includes('que sabes hacer') ||
      msg.includes('que comandos hay') ||
      (msg.includes('ayuda') && (msg.includes('chat') || msg.includes('nutrio') || msg.includes('opciones')));

    if (pideAyuda) {
      this._lastTopic = null;
      const chips = [
        { label: '🇦🇷 Recetas argentinas', msg: 'receta argentina' },
        { label: '🍸 Modo barman', msg: 'modo barman' },
        { label: '🎉 Día libre', msg: 'dia libre' }
      ].map(c =>
        `<span class="chip-sm tap-feedback" onclick="UI.sendQuickReply('${c.msg}')">${c.label}</span>`
      ).join('');

      return this.pickVariant('ayuda', [
        (h) => `Esto es lo que puedo hacer${h}, además de armarte el día a día: tocá alguno 👇<div class="ingredient-picker-chips">${chips}</div>`
      ], name);
    }

    // --- Pedido de una receta argentina puntual ---
    const pideArgentina =
      msg.includes('receta argentina') ||
      msg.includes('comida argentina') ||
      msg.includes('algo argentino') ||
      msg.includes('plato argentino') ||
      msg.includes('cocina argentina') ||
      msg.includes('recetas argentinas') ||
      (msg.includes('argentin') && (msg.includes('comer') || msg.includes('receta') || msg.includes('comida')));

    if (pideArgentina) {
      return this._respondArgentina(profile);
    }

    // --- Caso especial: pregunta por el mate (antes de todo lo demás) ---
    const hablaDeMate = /\bmate\b/.test(msg) && !msg.includes('matematica');
    if (hablaDeMate && !msg.includes('no me gusta')) {
      const now = new Date();
      const horaTxt = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      this._lastTopic = 'bebida';
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
        (n) => `¡Nos vemos${n}! Cualquier cosita acá ando. Que tengas un lindo resto del día. 🌱`,
        (n) => `¡Listo${n}, hasta la próxima! Si te tienta algo raro de comer, ya sabés dónde encontrarme. 😉`,
        (n) => `¡Dale${n}, cuidate! Nos vemos prontito por acá. 🍎`,
        (n) => `¡Chau chau${n}! Fue un gusto charlar, ¡a comer rico! 🥗`
      ], name);
    }

    // --- "¿Qué comí hoy?" / "cuánto llevo comido" — repasa el registro del día ---
    const preguntaQueComiHoy =
      msg.includes('que comi hoy') ||
      msg.includes('que comi en el dia') ||
      msg.includes('cuanto comi') ||
      msg.includes('cuanto llevo comido') ||
      msg.includes('cuantas calorias llevo') ||
      msg.includes('cuantas kcal llevo') ||
      msg.includes('mi registro de hoy') ||
      msg.includes('que anote hoy') ||
      msg.includes('resumen del dia') ||
      msg.includes('resumen de hoy');

    if (preguntaQueComiHoy) {
      const log = MealLog.getToday();
      this._lastTopic = null;

      if (!log.length) {
        return this.pickVariant('registro_vacio', [
          `Todavía no tenés nada anotado hoy. Cuando abras una receta, tocá "Ya lo comí" para que quede registrada, o contame acá mismo qué comiste (por ejemplo "comí una ensalada de pollo"). 📝`
        ]);
      }

      const items = log.map(e => `${e.name}${e.kcal ? ` (${e.kcal} kcal)` : ''} — ${e.time}`).join('<br>');
      const total = MealLog.totalKcalToday();
      let kcalNote;
      if (total > 0 && profile && profile.targetKcal) {
        const restante = profile.targetKcal - total;
        kcalNote = restante >= 0
          ? ` Vas por **${total} kcal** de tu meta de ${profile.targetKcal} kcal — te quedan ${restante} kcal disponibles hoy.`
          : ` Vas por **${total} kcal**, ya pasaste tu meta de ${profile.targetKcal} kcal por ${Math.abs(restante)} kcal. Nada grave, mañana ajustamos. 😉`;
      } else if (total > 0) {
        kcalNote = ` Llevás **${total} kcal** anotadas hoy.`;
      } else {
        kcalNote = ` (Algunas entradas no tienen kcal cargada porque las anotaste como texto libre.)`;
      }

      return this.pickVariant('registro_hoy', [
        (i, k) => `Hoy anotaste esto:<br>${i}<br>${k}`,
        (i, k) => `Tu registro de hoy:<br>${i}<br>${k}`
      ], items, kcalNote);
    }

    // --- "Comí X" / "acabo de comer X" — registra una comida por texto libre ---
    // (después de traducir lunfardo, "morfé/manyé/tragué X" ya llega acá como "comí X")
    const comidaLibreMatch = msg.match(/\b(?:ya\s+)?com[ií]\s+(.+)/) || msg.match(/\bacabo de comer\s+(.+)/);
    const noEsPreguntaSobreComer =
      !msg.includes('que puedo comer') && !msg.includes('que como') &&
      !msg.includes('que comer') && !msg.includes('quiero comer') &&
      !msg.includes('algo para comer') && !msg.includes('hay para comer');

    if (comidaLibreMatch && noEsPreguntaSobreComer) {
      const rawName = comidaLibreMatch[1].trim().replace(/[.!?]+$/, '');
      if (rawName) {
        MealLog.add({ name: rawName, kcal: null, slot: this._getMealSlot().key });
        Achievements.trackRecipeTried(rawName);
        const total = MealLog.totalKcalToday();
        this._lastTopic = 'comida';
        return this.pickVariant('registro_comida_libre', [
          (n) => `Anotado: **${n}** ✅. No tengo las kcal exactas porque lo escribiste vos (no es una receta de la base), pero ya quedó en tu registro de hoy. Pedime "qué comí hoy" cuando quieras repasarlo.`,
          (n) => `Listo, sumé **${n}** a tu registro de hoy ✅. Si querés ver todo lo anotado, pedime "resumen de hoy".`
        ], rawName);
      }
    }

    // --- "¿Cuál es mi racha?" ---
    const preguntaRacha =
      msg.includes('mi racha') || msg.includes('cual es mi racha') ||
      msg.includes('racha tengo') || msg.includes('cuantos dias llevo');

    if (preguntaRacha) {
      const count = Streak.getCount();
      const longest = Streak.getLongest();
      this._lastTopic = null;
      return this.pickVariant('racha_info', [
        (c, l) => `🔥 Llevás **${c} día(s)** seguidos usando NutrIO. Tu mejor racha hasta ahora fue de ${l} día(s). ¡A seguir sumando!`
      ], count, longest);
    }

    // --- "¿Qué logros tengo?" / "mis insignias" ---
    const preguntaLogros =
      msg.includes('mis logros') || msg.includes('mis insignias') ||
      msg.includes('que logros tengo') || msg.includes('mis medallas');

    if (preguntaLogros) {
      const all = Achievements.getAllWithStatus();
      const unlocked = all.filter(a => a.unlocked);
      this._lastTopic = null;
      if (!unlocked.length) {
        return this.pickVariant('logros_vacio', [
          `Todavía no desbloqueaste ningún logro, pero ya vas a ir sumando: registrá comidas, probá recetas nuevas y mantené la racha. Fijate todos los logros disponibles (y los que te faltan) en tu **Perfil**. 🏆`
        ]);
      }
      const lista = unlocked.map(a => `${a.icon} ${a.name}`).join(', ');
      return this.pickVariant('logros_lista', [
        (l) => `Tus logros hasta ahora: ${l}. Mirá el detalle completo (y los que te faltan) en tu **Perfil**. 🏆`
      ], lista);
    }

    // --- Domingo / día permitido ---
    const hablaDeDomingo =
      msg.includes('domingo') ||
      msg.includes('dia permitido') ||
      msg.includes('cheat day');

    if (hablaDeDomingo) {
      const esHoyDomingo = typeof MealEngine !== 'undefined' && MealEngine.isCheatDay(new Date());
      this._lastTopic = null;
      if (esHoyDomingo) {
        return this.pickVariant('domingo_hoy', [
          `¡Justo hoy es domingo, tu día permitido! 🍷 Podés darte un gusto extra: las bebidas con alcohol están habilitadas y las comidas son un poco más relajadas. Fijate en **Inicio** o **Semana** para ver las opciones de hoy.`,
          `Hoy es domingo, así que es día permitido por acá: podés sumar algo con alcohol si querés. Mirá **Inicio** o **Semana** para ver qué te armé para hoy. 🍷`
        ]);
      }
      return this.pickVariant('domingo_no_hoy', [
        `El domingo es el día permitido acá: ahí sí entran opciones con alcohol y algo más relajado en las comidas. Hoy no es domingo, así que seguimos con el plan de siempre... ¡pero ya va a llegar! 😉`,
        `Los domingos son especiales: día permitido, con alguna opción con alcohol habilitada en las comidas. Hoy todavía no es domingo, pero falta poco. Mientras tanto, pedime "qué puedo comer" y seguimos con tu plan normal. 🙌`
      ]);
    }

    // --- Comando "día libre": fuerza el modo día permitido acá mismo en el chat,
    // sin depender de que hoy sea domingo de verdad. Muestra una receta + bebida
    // (con la opción de alcohol habilitada) para la franja horaria actual.
    const pideDiaLibre =
      msg.includes('dia libre') ||
      msg.includes('modo dia libre') ||
      msg.includes('activa dia libre') ||
      msg.includes('quiero mi dia libre');

    if (pideDiaLibre) {
      const slot = this._getMealSlot();
      const recipe = this._getRandomRecipeForSlot(slot.key, profile, true);
      const drink = this._getRandomDrinkForSlot(slot.key, profile, true);
      this._lastTopic = 'comida';

      if (!recipe) {
        return this.pickVariant('dia_libre_sin_receta', [
          `Che, día libre activado 🍷, pero todavía no tengo recetas cargadas para esta franja. Fijate en Inicio o Semana.`
        ]);
      }

      const ing = recipe.ingredients ? recipe.ingredients.join(', ') : '';
      let drinkTxt = '';
      if (drink && drink.sinAlcohol) {
        drinkTxt = ` Para acompañar, va bien con ${drink.sinAlcohol}`;
        drinkTxt += drink.conAlcohol
          ? `, o si querés date el gusto con ${drink.conAlcohol} 🍷 (te lo habilito porque pediste día libre).`
          : '.';
      }

      return this.pickVariant('dia_libre', [
        (r, i, d) => `¡Dale, activamos tu día libre! 🍷 Para esta franja te tiro: **${r.name}** (${r.kcal} kcal) con ${i}.${d} Si querés otra idea, pedime "otra opción" y seguimos. 🔄`,
        (r, i, d) => `Día libre activado 🎉. Va **${r.name}** (${r.kcal} kcal), con ${i}.${d} ¿Te copa o probamos otra?`
      ], recipe, ing, drinkTxt);
    }

    // --- Pedido explícito de otra opción de BEBIDA ---
    const pideOtraBebida =
      msg.includes('otra bebida') || msg.includes('otro trago') ||
      msg.includes('otra opcion para tomar') || msg.includes('otra opcion de tomar') ||
      msg.includes('otra cosa para tomar') || msg.includes('algo distinto para tomar');

    if (pideOtraBebida) {
      const slot = this._getMealSlot();
      const drink = this._getRandomDrinkForSlot(slot.key, profile);
      this._lastTopic = 'bebida';
      if (!drink || !drink.sinAlcohol) {
        return this.pickVariant('otra_bebida_sin_datos', [
          `Todavía no tengo bebidas cargadas para esta franja, pero fijate en Inicio o en la Semana para ver qué te armé.`
        ]);
      }
      return this.pickVariant('otra_bebida', [
        (d) => `Dale, otra opción: ${d.sinAlcohol}${d.conAlcohol ? `. Y como hoy es día permitido, también entra ${d.conAlcohol} 🍷` : '.'} 🥤`,
        (d) => `Ahí va otra: ${d.sinAlcohol}${d.conAlcohol ? `, o si preferís, ${d.conAlcohol} porque hoy es día permitido 🍷` : ''}. ¿Esta te copa más? 😄`
      ], drink);
    }

    // --- Pedido explícito de otra opción de COMIDA ---
    const pideOtraComida =
      msg.includes('otra receta') || msg.includes('otra comida') ||
      msg.includes('otra opcion de comer') || msg.includes('otra opcion para comer') ||
      msg.includes('no me convence');

    // --- Pedido genérico de "otra opción" (usa el último tema tratado) ---
    const pideOtraGenerica =
      msg.includes('otra opcion') || msg.includes('dame otra') ||
      msg.includes('algo distinto') || msg.includes('otra cosa');

    if (pideOtraComida || (pideOtraGenerica && this._lastTopic !== 'bebida')) {
      const slot = this._getMealSlot();
      const recipe = this._getRandomRecipeForSlot(slot.key, profile);
      this._lastTopic = 'comida';
      if (!recipe) {
        return this.pickVariant('otra_comida_sin_datos', [
          `Todavía no tengo recetas cargadas para esta franja, pero fijate en Inicio o en la Semana para ver qué te armé.`
        ]);
      }
      const ing = (recipe.ingredients || []).join(', ');
      return this.pickVariant('otra_opcion', [
        (r, i) => `Dale, otra vuelta: **${r.name}** (${r.kcal} kcal) con ${i}. Si tampoco te cierra, pedime otra y seguimos probando. 🔄`,
        (r, i) => `Ahí va otra: **${r.name}** (${r.kcal} kcal), con ${i}. ¿Esta te copa más? 😄`
      ], recipe, ing);
    }

    if (pideOtraGenerica && this._lastTopic === 'bebida') {
      const slot = this._getMealSlot();
      const drink = this._getRandomDrinkForSlot(slot.key, profile);
      if (drink && drink.sinAlcohol) {
        return this.pickVariant('otra_bebida', [
          (d) => `Dale, otra opción: ${d.sinAlcohol}${d.conAlcohol ? `. Y como hoy es día permitido, también entra ${d.conAlcohol} 🍷` : '.'} 🥤`,
          (d) => `Ahí va otra: ${d.sinAlcohol}${d.conAlcohol ? `, o si preferís, ${d.conAlcohol} porque hoy es día permitido 🍷` : ''}. ¿Esta te copa más? 😄`
        ], drink);
      }
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
      const drink = this._getRandomDrinkForSlot(slot.key, profile);
      const now = new Date();
      const horaTxt = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      this._lastTopic = 'bebida';

      if (!drink || !drink.sinAlcohol) {
        return this.pickVariant('que_tomar_sin_bebida', [
          (h, l) => `Son las ${h}, momento de **${l}**. Todavía no tengo bebidas cargadas, pero fijate en Inicio o en la Semana para ver qué te armé.`
        ], horaTxt, slot.label);
      }

      return this.pickVariant('que_tomar', [
        (h, l, d) => `Son las ${h}, así que para **${l}** te tiro ${d.sinAlcohol}${d.conAlcohol ? `. Y como hoy es día permitido, también te podés dar el gusto con ${d.conAlcohol} 🍷` : '.'} Si querés otra idea, pedime "otra bebida" y te tiro otra. 🥤`,
        (h, l, d) => `Para acompañar tu **${l}** (son las ${h}), va bien ${d.sinAlcohol}${d.conAlcohol ? `, o si querés algo con onda, ${d.conAlcohol} porque hoy es día permitido 🍷` : ''}. ¿Querés otra opción? Solo pedímela. 🥤`,
        (h, l, d) => `A las ${h}, en **${l}**, te sugiero ${d.sinAlcohol}${d.conAlcohol ? `. Ya que es domingo (día permitido), también entra ${d.conAlcohol} 🍷` : '.'} Si no te cierra, pedime otra bebida y probamos con otra. 🥤`
      ], horaTxt, slot.label, drink);
    }

    // --- "¿Qué puedo comer/cenar/almorzar/desayunar/merendar ahora?" ---
    // (incluye variantes en lunfardo, ya normalizadas arriba a "comer")
    const preguntaQueComer =
      (msg.includes('que puedo comer') ||
       msg.includes('que como') ||
       msg.includes('que comer') ||
       msg.includes('que puedo cenar') ||
       msg.includes('que ceno') ||
       msg.includes('que puedo almorzar') ||
       msg.includes('que almuerzo') ||
       msg.includes('que puedo desayunar') ||
       msg.includes('que desayuno') ||
       msg.includes('que puedo merendar') ||
       msg.includes('que meriendo') ||
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
      const slot = this._getRequestedSlot(msg);
      const recipes = this._getRandomRecipesForSlot(slot.key, profile, 3);
      const drink = this._getRandomDrinkForSlot(slot.key, profile);
      const now = new Date();
      const horaTxt = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      this._lastTopic = 'comida';

      if (!recipes.length) {
        return this.pickVariant('que_comer_sin_receta', [
          (h, l) => `Son las ${h}, momento de **${l}**. Todavía no tengo tus recetas cargadas, pero fijate en Inicio o en la Semana para ver qué te armé.`
        ], horaTxt, slot.label);
      }

      let restriccionesNote = '';
      if (profile && profile.restrictions && profile.restrictions.length) {
        restriccionesNote = ` (ya tuve en cuenta que sos ${profile.restrictions.join(', ')})`;
      }

      let drinkTxt = '';
      if (drink && drink.sinAlcohol) {
        drinkTxt = ` Para acompañar, va bien con ${drink.sinAlcohol}`;
        drinkTxt += drink.conAlcohol
          ? `, o si querés date el gusto con ${drink.conAlcohol} (hoy es día permitido 🍷).`
          : '.';
      }

      const cardsHTML = (typeof UI !== 'undefined' && UI._buildChatRecipeCardsHTML) ? UI._buildChatRecipeCardsHTML(recipes) : '';

      return this.pickVariant('que_comer', [
        (h, l, note, d, cards) => `Son las ${h}, así que te toca **${l}**${note}. Te tiro 3 opciones:${cards}${d} Tocá la que más te copa para ver la receta completa. Si ninguna te cierra, pedime "otra opción". 🍽️`,
        (h, l, note, d, cards) => `Mirá la hora, son las ${h}: momento de **${l}**${note}. Estas son 3 ideas:${cards}${d} Tocá alguna para ver el paso a paso. 😋`,
        (h, l, note, d, cards) => `A las ${h} te toca **${l}**${note}. Elegí entre estas 3:${cards}${d} Si ninguna te tienta, pedime otra tanda. 🍽️`
      ], horaTxt, slot.label, restriccionesNote, drinkTxt, cardsHTML);
    }

    // --- Saludos ---
    if (msg.includes('hola') || msg.includes('buen') || msg.includes('que onda') || msg.includes('como andas') || msg.includes('todo bien')) {
      const streakCount = (typeof Streak !== 'undefined') ? Streak.getCount() : 0;
      const streakTxt = streakCount > 1 ? ` Llevás **${streakCount} días seguidos** por acá, no aflojes 🔥.` : '';
      return this.pickVariant('saludo', [
        (n, s) => `¡Qué hacés${n}! Todo tranqui por acá.${s} ¿Qué andás cocinando o qué duda tenés hoy? Mirá que no muerdo... a menos que traigas facturas de dulce de leche. 🥞`,
        (n, s) => `¡Hola${n}! ¿Cómo va todo?${s} Contame qué se te antoja o qué necesitás y vemos qué inventamos. 🍳`,
        (n, s) => `¡Buenas${n}!${s} Acá andamos, listos para pensar en comida rica y sana. ¿En qué te ayudo?`,
        (n, s) => `¡Ey${n}! Justo estaba pensando en recetas.${s} ¿Charlamos de comida o tenés otra duda?`,
        (n, s) => `¡Qué tal${n}! Todo en orden por NutrIO.${s} Decime qué necesitás y vamos viendo. 😊`
      ], name, streakTxt);
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
      this._lastTopic = 'comida';
      if (profile && profile.restrictions && profile.restrictions.length) {
        return this.pickVariant('receta_con_restricciones', [
          (p) => `Ya agendé tus mañas de alimentación: "${p.restrictions.join(', ')}". Si vas a las pestañas de **Inicio** o **Semana**, vas a ver las recetas ricas que armé cuidando tu perfil. Y si querés que te tire alguna acá mismo, preguntame qué puedo comer. 🥗`,
          (p) => `Tengo anotado que evitás: ${p.restrictions.join(', ')}. Fijate en **Inicio** o **Semana**, ahí te armé opciones que respetan eso. O pedime directamente una opción para esta hora. 🍽️`
        ], profile);
      }
      return this.pickVariant('receta_sin_restricciones', [
        `¡Uff, alta hora para comer! Pegale una mirada a la solapa de **Inicio** o **Semana**. Te armé un menú personalizado espectacular para tu objetivo. O preguntame "qué puedo comer" y te tiro una opción directamente acá.`,
        `Dale, andá a **Inicio** o **Semana** que ahí tenés el menú pensado para vos según tu objetivo. ¡A comer rico! 🍴 También podés preguntarme acá mismo si querés una idea rápida.`
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
