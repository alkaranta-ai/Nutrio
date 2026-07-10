// ==========================================================================
// NUTRIO - ARCHIVO PRINCIPAL DE APLICACIÓN (js/app.js)
// ==========================================================================

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
      if (errorBox) {
        errorBox.classList.add('show');
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        alert("Por favor, completa todos los campos obligatorios y selecciona tu actividad y objetivo.");
      }
      return;
    }
    if (errorBox) errorBox.classList.remove('show');

    const allergiesRaw = document.getElementById('fAllergies').value.trim();
    const dislikesRaw = document.getElementById('fDislikes').value.trim();
    const favoriteFoodsRaw = document.getElementById('fFavoriteFoods').value.trim();
    const waterGlasses = document.getElementById('fWaterGlasses').value;
    const sleepHours = document.getElementById('fSleepHours').value;
    const chatCustom = document.getElementById('fChatCustom').value.trim();

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

  autoGenerateCart() {
    let itemsSet = new Set();
    if (typeof RECIPES_DB !== 'undefined') {
      RECIPES_DB.forEach(r => {
        if (r.category === 'antojo') return;
        r.ingredients.forEach(ing => itemsSet.add(ing));
      });
    }
    StorageApp.saveCart(Array.from(itemsSet));
  }
};

// ==========================================================================
// Estilos inyectados para agrandar el cajón de chat en el celu.
// No tengo acceso a tu CSS/HTML, así que esto se aplica en runtime.
// Si tenés styles.css a mano, lo ideal es mover estas reglas ahí.
// ==========================================================================
function injectChatInputStyles() {
  if (document.getElementById('nutrio-chat-input-boost')) return;
  const style = document.createElement('style');
  style.id = 'nutrio-chat-input-boost';
  style.textContent = `
    #chatInputBar {
      padding: 14px 16px !important;
      display: flex !important;
      align-items: flex-end !important;
      gap: 10px !important;
    }
    #chatInputBar textarea,
    #chatInputBar input[type="text"],
    #chatInput {
      min-height: 52px !important;
      max-height: 140px !important;
      font-size: 16px !important;
      padding: 14px 16px !important;
      border-radius: 16px !important;
      line-height: 1.4 !important;
      resize: none !important;
    }
    #chatInputBar button {
      min-width: 52px !important;
      min-height: 52px !important;
      font-size: 18px !important;
      border-radius: 14px !important;
    }
    .chat-feedback button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 2px 4px;
      opacity: 0.5;
      transition: opacity 0.15s ease, transform 0.15s ease;
    }
    .chat-feedback button:hover {
      transform: scale(1.15);
    }
    .chat-feedback button.active {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  // Si #chatInput es un <textarea>, además le agrandamos las filas visibles
  const inputEl = document.getElementById('chatInput');
  if (inputEl && inputEl.tagName === 'TEXTAREA' && !inputEl.getAttribute('rows')) {
    inputEl.setAttribute('rows', '2');
  }
}

const UI = {
  init() {
    injectChatInputStyles();

    // IMPORTANTE: Primero le damos vida a las escuchas de los chips pase lo que pase
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
    this.goto('chat');
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
  },

  renderHome() {
    const profile = StorageApp.getProfile();
    if (!profile || typeof RECIPES_DB === 'undefined') return;
    document.getElementById('homeGreeting').innerText = `¡Hola, ${profile.name}!`;
    document.getElementById('kcalDisplayTarget').innerText = `Tu requerimiento diario: ${profile.targetKcal} kcal / Objetivo Activo.`;

    const container = document.getElementById('dayMealsContainer');
    if (!container) return;

    const isHigh = profile.targetKcal > 1700;
    const breakfast = isHigh ? RECIPES_DB[1] : RECIPES_DB[0];
    const lunch = isHigh ? RECIPES_DB[3] : RECIPES_DB[2];
    const snack = isHigh ? RECIPES_DB[5] : RECIPES_DB[4];
    const dinner = isHigh ? RECIPES_DB[7] : RECIPES_DB[6];

    container.innerHTML = `
      <div class="card">
        <div class="meal-slot"><div class="meal-title">Desayuno</div><h3>${breakfast?.name || 'Desayuno Saludable'}</h3><p style="font-size:13px; color:var(--text-muted);">${breakfast?.kcal || 350} kcal • ${breakfast?.ingredients.join(', ') || ''}</p></div>
        <div class="meal-slot"><div class="meal-title">Almuerzo</div><h3>${lunch?.name || 'Almuerzo Balanced'}</h3><p style="font-size:13px; color:var(--text-muted);">${lunch?.kcal || 600} kcal • ${lunch?.ingredients.join(', ') || ''}</p></div>
        <div class="meal-slot"><div class="meal-title">Merienda</div><h3>${snack?.name || 'Merienda Ligera'}</h3><p style="font-size:13px; color:var(--text-muted);">${snack?.kcal || 200} kcal • ${snack?.ingredients.join(', ') || ''}</p></div>
        <div class="meal-slot"><div class="meal-title">Cena</div><h3>${dinner?.name || 'Cena Nutritiva'}</h3><p style="font-size:13px; color:var(--text-muted);">${dinner?.kcal || 500} kcal • ${dinner?.ingredients.join(', ') || ''}</p></div>
      </div>
    `;
  },

  renderWeeklyPlan() {
    const container = document.getElementById('weeklyPlanContainer');
    if (!container || typeof RECIPES_DB === 'undefined') return;

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    container.innerHTML = days.map((day, idx) => {
      const mainPlate = RECIPES_DB[2 + (idx % 2)];
      const dinnerPlate = RECIPES_DB[6 + (idx % 2)];
      return `
        <div class="card" style="margin-bottom:12px;">
          <h3 style="color:var(--primary); margin-bottom:6px;">${day}</h3>
          <p style="font-size:14px; color:var(--text);"><b>Almuerzo:</b> ${mainPlate?.name || 'Plato Principal'} (${mainPlate?.kcal || 550} kcal)</p>
          <p style="font-size:14px; color:var(--text); margin-top:2px;"><b>Cena:</b> ${dinnerPlate?.name || 'Plato Cena'} (${dinnerPlate?.kcal || 450} kcal)</p>
        </div>
      `;
    }).join('');
  },

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

    let historial = JSON.parse(localStorage.getItem('nutrio_history')) || [];
    html += `<div style="margin-top:25px; border-top:1px dashed #ccc; padding-top:15px;">
              <h4 style="margin-bottom:10px; color:var(--text);">🗃️ Carrito e Historial de Compras</h4>`;

    if (historial.length === 0) {
      html += `<p style="font-size:12px; color:gray;">Aún no guardaste compras. Lo que tildes arriba quedará registrado acá por día.</p>`;
    } else {
      historial.forEach(h => {
        html += `<div style="background:rgba(0,0,0,0.02); padding:8px; border-radius:6px; margin-bottom:6px; font-size:13px;">
                  <b>📅 Día ${h.date}:</b> ${h.items.join(', ')}
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
    alert("¡Espectacular! Guardado en tu historial. Los artículos se destildaron para que la lista te quede limpia.");
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

    const countryText = countryLabels[profile.country] || '—';
    const activityText = activityLabels[profile.activity] || '—';
    const goalText = goalLabels[profile.goals?.[0]] || '—';
    const healthText = (profile.healthConditions || []).map(h => healthLabels[h] || h).join(', ') || 'Ninguna';
    const allergiesText = (profile.allergies || []).join(', ') || 'Ninguna';
    const restrictionsText = (profile.restrictions || []).map(r => restrictionLabels[r] || r).join(', ') || 'Ninguna';
    const dislikesText = (profile.dislikes || []).join(', ') || 'Ninguno';

    prefsEl.innerHTML = `
      <b>País:</b> ${countryText} · <b>Actividad:</b> ${activityText}<br>
      <b>Objetivo:</b> ${goalText}<br>
      <b>Condiciones de salud:</b> ${healthText}<br>
      <b>Alergias:</b> ${allergiesText}<br>
      <b>Restricciones:</b> ${restrictionsText}<br>
      <b>Evita:</b> ${dislikesText}<br>
      <b>Estilo de Chat:</b> Amigable con Humor 🎭
    `;
  },

  sendChat() {
    const input = document.getElementById('chatInput');
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();

    const scroll = document.getElementById('chatScroll');
    if (scroll) {
      scroll.innerHTML += `<div style="text-align:right; margin-bottom:10px;"><span style="background:var(--primary-dim); color:var(--primary); padding:8px 12px; border-radius:12px; display:inline-block; font-size:14px;">${msg}</span></div>`;
    }

    input.value = '';

    setTimeout(() => {
      const profile = StorageApp.getProfile();
      const response = ChatApp.getBotResponse(msg, profile);
      const msgId = 'chatmsg_' + Date.now() + '_' + Math.floor(Math.random() * 10000);

      if (scroll) {
        scroll.innerHTML += `
          <div style="text-align:left; margin-bottom:10px;" id="${msgId}">
            <span style="background:var(--bg); padding:8px 12px; border-radius:12px; display:inline-block; font-size:14px;">${response.text}</span>
            <div class="chat-feedback" style="margin-top:2px;">
              <button type="button" data-role="like" title="Me gusta" onclick="UI.rateResponse('${msgId}', '${response.category}', ${response.idx}, true)">👍</button>
              <button type="button" data-role="dislike" title="No me gusta" onclick="UI.rateResponse('${msgId}', '${response.category}', ${response.idx}, false)">👎</button>
            </div>
          </div>`;
        scroll.scrollTop = scroll.scrollHeight;
      }
    }, 400);
  },

  // Guarda si al usuario le gustó o no una respuesta puntual del bot.
  // Esto hace que ChatApp deje de repetir las variantes marcadas con 👎
  // (y priorice, dentro de lo posible, las que tuvieron 👍).
  rateResponse(msgId, category, idx, liked) {
    ChatApp.recordFeedback(category, idx, liked);

    const container = document.getElementById(msgId);
    if (!container) return;
    const likeBtn = container.querySelector('[data-role="like"]');
    const dislikeBtn = container.querySelector('[data-role="dislike"]');
    if (likeBtn) likeBtn.classList.toggle('active', liked);
    if (dislikeBtn) dislikeBtn.classList.toggle('active', !liked);
  },

  resetAll() {
    StorageApp.clearAll();
    location.reload();
  }
};

// ==========================================================================
// MÓDULO DE CHAT (única declaración global, sin duplicados)
// ==========================================================================
window.ChatApp = {

  // Guarda el último índice mostrado por categoría, para no repetir dos veces seguidas.
  _lastVariantByCategory: {},

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

  // Usa exactamente la misma lógica que UI.renderHome() para elegir la receta,
  // así el chat y la solapa de Inicio jamás se contradicen.
  _getRecipeForSlot(slotKey, profile) {
    if (typeof RECIPES_DB === 'undefined' || !RECIPES_DB.length) return null;
    const isHigh = profile && profile.targetKcal > 1700;

    const map = {
      desayuno: isHigh ? RECIPES_DB[1] : RECIPES_DB[0],
      almuerzo: isHigh ? RECIPES_DB[3] : RECIPES_DB[2],
      merienda: isHigh ? RECIPES_DB[5] : RECIPES_DB[4],
      cena: isHigh ? RECIPES_DB[7] : RECIPES_DB[6]
    };

    if (map[slotKey]) return map[slotKey];

    // Madrugada: buscamos algo categorizado como "antojo"; si no hay, caemos a merienda.
    const antojoRecipe = RECIPES_DB.find(r => r.category === 'antojo');
    return antojoRecipe || map.merienda;
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

  getBotResponse(userMessage, profile) {
    const msg = this._normalize(userMessage);
    const name = profile && profile.name ? ` ${profile.name}` : ' che';

    // --- Caso especial: pregunta por el mate (antes de todo lo demás) ---
    const hablaDeMate = /\bmate\b/.test(msg) && !msg.includes('matematica');
    if (hablaDeMate && !msg.includes('no me gusta')) {
      const now = new Date();
      const horaTxt = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
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
        (n) => `¡Nos vemos${n}! Cualquier cosa acá ando. Que tengas un lindo resto del día. 🌱`,
        (n) => `¡Listo${n}, hasta la próxima! Si te tienta algo raro de comer, ya sabés dónde encontrarme. 😉`,
        (n) => `¡Dale${n}, cuidate! Nos vemos prontito por acá. 🍎`,
        (n) => `¡Chau chau${n}! Fue un gusto charlar, ¡a comer rico! 🥗`
      ], name);
    }

    // --- "¿Qué puedo comer ahora?" tiene prioridad sobre el resto ---
    // (incluye variantes en lunfardo, ya normalizadas arriba a "comer")
    const preguntaQueComer =
      (msg.includes('que puedo comer') ||
       msg.includes('que como') ||
       msg.includes('que comer') ||
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
      const slot = this._getMealSlot();
      const recipe = this._getRecipeForSlot(slot.key, profile);
      const now = new Date();
      const horaTxt = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

      if (!recipe) {
        return this.pickVariant('que_comer_sin_receta', [
          (h, l) => `Son las ${h}, momento de **${l}**. Todavía no tengo tus recetas cargadas, pero fijate en Inicio o en la Semana para ver qué te armé.`
        ], horaTxt, slot.label);
      }

      const ingredientesTxt = recipe.ingredients ? recipe.ingredients.join(', ') : '';
      let restriccionesNote = '';
      if (profile && profile.restrictions && profile.restrictions.length) {
        restriccionesNote = ` (ya tuve en cuenta que sos ${profile.restrictions.join(', ')})`;
      }

      return this.pickVariant('que_comer', [
        (h, l, r, ing, note) => `Son las ${h}, así que te toca **${l}**${note}: **${r.name}** (${r.kcal} kcal) con ${ing}. Está armado también en la solapa de Inicio si querés verlo con detalle. 🍽️`,
        (h, l, r, ing, note) => `Mirá la hora, son las ${h}: momento de **${l}**${note}. Te tiro esta: **${r.name}** (${r.kcal} kcal) con ${ing}. Lo tenés también en Inicio. 😋`,
        (h, l, r, ing, note) => `A las ${h} te toca directamente **${l}**${note}. Va **${r.name}** (${r.kcal} kcal), con ${ing}. Chequealo en Inicio si querés más detalle. 🍽️`
      ], horaTxt, slot.label, recipe, ingredientesTxt, restriccionesNote);
    }

    // --- Saludos ---
    if (msg.includes('hola') || msg.includes('buen') || msg.includes('que onda') || msg.includes('como andas') || msg.includes('todo bien')) {
      return this.pickVariant('saludo', [
        (n) => `¡Qué hacés${n}! Todo tranqui por acá. ¿Qué andás cocinando o qué duda tenés hoy? Mirá que no muerdo... a menos que traigas facturas de dulce de leche. 🥞`,
        (n) => `¡Hola${n}! ¿Cómo va todo? Contame qué se te antoja o qué necesitás y vemos qué inventamos. 🍳`,
        (n) => `¡Buenas${n}! Acá andamos, listos para pensar en comida rica y sana. ¿En qué te ayudo?`,
        (n) => `¡Ey${n}! Justo estaba pensando en recetas. ¿Charlamos de comida o tenés otra duda?`,
        (n) => `¡Qué tal${n}! Todo en orden por NutrIO. Decime qué necesitás y vamos viendo. 😊`
      ], name);
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
      if (profile && profile.restrictions && profile.restrictions.length) {
        return this.pickVariant('receta_con_restricciones', [
          (p) => `Ya agendé tus mañas de alimentación: "${p.restrictions.join(', ')}". Si vas a las pestañas de **Inicio** o **Semana**, vas a ver las recetas ricas que armé cuidando tu perfil. 🥗`,
          (p) => `Tengo anotado que evitás: ${p.restrictions.join(', ')}. Fijate en **Inicio** o **Semana**, ahí te armé opciones que respetan eso. 🍽️`
        ], profile);
      }
      return this.pickVariant('receta_sin_restricciones', [
        `¡Uff, alta hora para comer! Pegale una mirada a la solapa de **Inicio** o **Semana**. Te armé un menú personalizado espectacular para tu objetivo.`,
        `Dale, andá a **Inicio** o **Semana** que ahí tenés el menú pensado para vos según tu objetivo. ¡A comer rico! 🍴`
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

window.addEventListener('DOMContentLoaded', () => { UI.init(); });
