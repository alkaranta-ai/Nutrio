// ARMADO DE PERFIL — pantalla única, sin pasos.
// Antes el formulario estaba dividido en varios "onb-step" y se trababa en el
// paso de restricciones porque faltaba una función. Ahora todo el perfil se
// completa y se valida en una sola pantalla con Onboarding.finish().
//
// RECIPES_DB vive en js/data.js (se carga antes que este archivo).

const Onboarding = {
  // Selecciones de chips en memoria (agregados los grupos que faltaban para que no se congele)
  selected: {
    activity: null,
    goal: null,
    health: [],
    restrictions: [],
    chatStyle: 'humor' // Por defecto seteamos humor con onda
  },

  // Un chip por grupo (actividad, objetivo, estilo de chat): al tocarlo se desactivan los demás.
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
    this._bindSingleSelect('chatStyleChips', 'chatStyle'); // Vincula dinámicamente si existe el elemento en el HTML
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
      errorBox.classList.add('show');
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    errorBox.classList.remove('show');

    const allergiesRaw = document.getElementById('fAllergies').value.trim();
    const dislikesRaw = document.getElementById('fDislikes').value.trim();

    // Capturamos de forma segura si tenés el selector en el HTML
    const chatStyleInput = document.getElementById('fChatStyle');
    if (chatStyleInput) this.selected.chatStyle = chatStyleInput.value;

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
      chatStyle: this.selected.chatStyle || 'humor'
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
    RECIPES_DB.forEach(r => {
      if (r.category === 'antojo') return;
      r.ingredients.forEach(ing => itemsSet.add(ing));
    });
    StorageApp.saveCart(Array.from(itemsSet));
  }
};

const UI = {
  init() {
    const profile = StorageApp.getProfile();
    if (!profile) {
      document.getElementById('onboarding').style.display = 'block';
      document.getElementById('app').style.display = 'none';
      Onboarding.bindAllChips();
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

    document.getElementById('chatInputBar').style.display = viewName === 'chat' ? 'block' : 'none';
  },

  renderHome() {
    const profile = StorageApp.getProfile();
    if (!profile) return;
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

  // FIX SÚPER: Independiente del array principal del carrito. Los checks no rompen nada.
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

    // Renderizamos el Historial abajo en el mismo contenedor
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
    
    // Destildamos la lista de hoy limpiando la cache del check temporal
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
    scroll.innerHTML += `<div style="text-align:right; margin-bottom:10px;"><span style="background:var(--primary-dim); color:var(--primary); padding:8px 12px; border-radius:12px; display:inline-block; font-size:14px;">${msg}</span></div>`;

    input.value = '';

    setTimeout(() => {
      const profile = StorageApp.getProfile();
      const response = ChatApp.getBotResponse(msg, profile);
      scroll.innerHTML += `<div style="text-align:left; margin-bottom:10px;"><span style="background:var(--bg); padding:8px 12px; border-radius:12px; display:inline-block; font-size:14px;">${response}</span></div>`;
      scroll.scrollTop = scroll.scrollHeight;
    }, 400);
  },

  resetAll() {
    StorageApp.clearAll();
    location.reload();
  }
};

// ==========================================
// MÓDULO DE CHAT - RECALIBRADO AMIGABLE CON HUMOR
// ==========================================
const ChatApp = {
  getBotResponse(userMessage, profile) {
    const msg = userMessage.toLowerCase();
    const name = profile && profile.name ? ` ${profile.name}` : 'che';

    if (msg.includes('hola') || msg.includes('buen')) {
      return `¡Qué hacés,${name}! Todo tranqui por acá. ¿Qué andás cocinando o qué duda tenés hoy? Mirá que no muerdo... a menos que traigas facturas de dulce de leche. 🥞`;
    }

    if (msg.includes('dieta') || msg.includes('calorias') || msg.includes('kcal')) {
      if (profile && profile.targetKcal) {
        return `A ver, según los cálculos científicos (y mágicos) que metimos en tu Perfil, te corresponden **${profile.targetKcal} kcal** al día. No te persigas tanto con los números y metele garra. 💪`;
      }
      return "Para no andar tirando fruta, te sugiero mirar las calorías asignadas directamente en la solapa de tu Perfil.";
    }

    if (msg.includes('receta') || msg.includes('cocinar') || msg.includes('comer')) {
      if (profile && profile.restrictions && profile.restrictions.length) {
        return `Ya agendé tus mañas de alimentación: "${profile.restrictions.join(', ')}". Si vas a las pestañas de **Inicio** o **Semana**, vas a ver las recetas ricas que armé cuidando tu perfil. 🥗`;
      }
      return `¡Uff, alta hora para comer! Pegale una mirada a la solapa de **Inicio** o **Semana**. Te armé un menú personalizado espectacular para tu objetivo.`;
    }

    if (msg.includes('no me gusta') || msg.includes('alerg') || msg.includes('evitar')) {
      return "Che, si hay cosas que te dan alergia o te caen como una patada, podés resetear la app abajo de todo en tu Perfil y armamos el Onboarding de cero en dos patadas.";
    }

    if (msg.includes('gracias') || msg.includes('bueno') || msg.includes('joya')) {
      return `¡De nada, genio/a! Si sentís olor a quemado en la cocina, chiflá que lo resolvemos. 😎`;
    }

    return `Mirá, me mataste con esa pregunta, pero te lo resumo al estilo NutriO: seguí metiéndole pilas, no te tientes con el delivery de hamburguesas y consultame lo que quieras. 😉`;
  }
};

window.addEventListener('DOMContentLoaded', () => { UI.init(); });
