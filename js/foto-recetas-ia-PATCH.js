// ==========================================================================
// PATCH: foto de ingredientes → reconocimiento real con IA (Gemini)
//
// Aplica estos 3 cambios en tu código. No es un archivo que se cargue solo:
// es una guía de "buscá esto → reemplazalo por esto" en tus archivos reales.
// ==========================================================================


// ==========================================================================
// CAMBIO 1 — en nutrioChatAI.js
// Buscá el final del archivo, justo ANTES del `})();` que cierra el IIFE
// (después de la definición de window.ChatApp.getBotResponseSmart), y
// agregá estas 3 líneas. Exponen lo que nutrioChatAI-fotos.js necesita
// para armar el MISMO contexto real (perfil, kcal, racha, logros) y usar
// el mismo Worker que ya tenías configurado.
// ==========================================================================

/*
  window.ChatApp.getBotResponseSmart = async function (userMessage, profile) {
    ... (tu código existente, no lo toques) ...
  };

  // ↓↓↓ AGREGAR ESTO ↓↓↓
  window.ChatApp._construirContextoIA = construirContexto;
  window.ChatApp._construirSystemPromptIA = construirSystemPrompt;
  window.ChatApp._WORKER_URL = WORKER_URL;
})();
*/


// ==========================================================================
// CAMBIO 2 — en app.js
// Buscá estas dos funciones dentro de UI (sección "FOTO DE INGREDIENTES →
// SUGERENCIA DE RECETAS") y reemplazalas ENTERAS por la versión de abajo.
// ==========================================================================

// --- BUSCAR Y BORRAR ESTO (tu versión actual) ---
/*
  handlePhotoSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      alert('Elegí un archivo de imagen (foto) para poder seguir.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this._addPhotoMessage(e.target.result);
      event.target.value = ''; // permite volver a elegir la misma foto si hace falta
    };
    reader.readAsDataURL(file);
  },

  _addPhotoMessage(dataUrl) {
    const scroll = document.getElementById('chatScroll');
    const now = new Date();
    if (scroll) {
      scroll.innerHTML += `
        <div class="msg-row user">
          <div class="msg-wrap">
            <div class="msg-bubble user msg-bubble-photo"><img class="chat-photo" src="${dataUrl}" alt="Foto de ingredientes"></div>
            <div class="msg-time">${this._formatTime(now)}</div>
          </div>
        </div>`;
      scroll.scrollTop = scroll.scrollHeight;
    }
    setTimeout(() => this._promptIngredientSelection(), 450);
  },
*/

// --- REEMPLAZAR POR ESTO ---

  handlePhotoSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type || !file.type.startsWith('image/')) {
      alert('Elegí un archivo de imagen (foto) para poder seguir.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Ahora le pasamos también el file (no solo el dataUrl), porque
      // _resolvePhoto necesita el archivo original para mandarlo a Gemini.
      this._addPhotoMessage(e.target.result, file);
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  },

  _addPhotoMessage(dataUrl, file) {
    const scroll = document.getElementById('chatScroll');
    const now = new Date();
    if (scroll) {
      scroll.innerHTML += `
        <div class="msg-row user">
          <div class="msg-wrap">
            <div class="msg-bubble user msg-bubble-photo"><img class="chat-photo" src="${dataUrl}" alt="Foto de ingredientes"></div>
            <div class="msg-time">${this._formatTime(now)}</div>
          </div>
        </div>`;
      scroll.scrollTop = scroll.scrollHeight;
    }
    setTimeout(() => this._resolvePhoto(file), 450);
  },

  // Intenta reconocer la foto DE VERDAD con la IA (Gemini, vía
  // ChatApp.getBotResponseConFoto de nutrioChatAI-fotos.js). Si esa función
  // no está cargada, o si falla por lo que sea (sin internet, límite diario
  // de IA alcanzado, worker caído, imagen no soportada), cae SIEMPRE a tu
  // picker local de chips de toda la vida (_promptIngredientSelection),
  // así el usuario nunca se queda sin poder buscar recetas por foto.
  async _resolvePhoto(file) {
    if (typeof ChatApp.getBotResponseConFoto !== 'function') {
      // nutrioChatAI-fotos.js no está cargado en este HTML todavía.
      this._promptIngredientSelection();
      return;
    }

    this._showTypingIndicator();
    const profile = StorageApp.getProfile();

    try {
      const response = await ChatApp.getBotResponseConFoto(file, '', profile);
      this._hideTypingIndicator();

      if (response.source === 'ia') {
        const msgId = 'chatmsg_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        const now = new Date();
        this._chatTextRefs[msgId] = response.text;
        const scroll = document.getElementById('chatScroll');
        if (scroll) {
          scroll.innerHTML += `
            <div class="msg-row bot" id="${msgId}">
              <div class="msg-wrap">
                <div class="msg-bubble bot">${response.text}</div>
                <div class="msg-time">${this._formatTime(now)}</div>
                <div class="chat-feedback">
                  <button type="button" data-role="speak" title="Escuchar" onclick="UI.speakMessage('${msgId}')">🔊</button>
                </div>
              </div>
            </div>`;
          scroll.scrollTop = scroll.scrollHeight;
        }
        if (Speech.enabled) Speech.speak(response.text);
        return;
      }

      // response.source === 'reglas' → la IA no pudo resolverlo (sin
      // internet, límite diario, error del worker). Fallback de siempre.
      this._promptIngredientSelection();
    } catch (err) {
      this._hideTypingIndicator();
      console.warn('NutrIO: fallback a picker local de ingredientes →', err.message);
      this._promptIngredientSelection();
    }
  },


// ==========================================================================
// CAMBIO 3 — en app.js, dentro de _injectSpeechToggle()
// Ahora mismo handlePhotoSelected no tiene ningún <input> que lo dispare.
// Buscá este bloque (el del botón de micrófono) dentro de _injectSpeechToggle:
// ==========================================================================

/*
    // --- Botón de micrófono: pegado a la izquierda de la flecha de enviar ---
    const inner = document.querySelector('.chat-input-inner');
    if (inner && !document.getElementById('voiceInputBtn')) {
      const sendBtn = inner.querySelector('.send-btn');

      const micBtn = document.createElement('button');
      micBtn.id = 'voiceInputBtn';
      micBtn.type = 'button';
      micBtn.title = 'Hablarle a NutrIO';
      micBtn.style.cssText = 'background:none; border:none; font-size:20px; cursor:pointer; padding:0 6px; line-height:1; transition: transform 0.15s; flex-shrink:0;';
      micBtn.innerText = '🎤';
      micBtn.onclick = () => VoiceInput.toggle();

      if (sendBtn) inner.insertBefore(micBtn, sendBtn);
      else inner.appendChild(micBtn);
    }

    if (Notifications.isEnabled()) Notifications.start();
  },
*/

// Y AGREGALE esto justo DESPUÉS del bloque del micrófono (antes del
// "if (Notifications.isEnabled())" final):

/*
    // --- Botón de cámara: mandar foto de ingredientes para sugerencia de recetas ---
    if (inner && !document.getElementById('chatPhotoInput')) {
      const micBtnRef = document.getElementById('voiceInputBtn');

      const photoInput = document.createElement('input');
      photoInput.type = 'file';
      photoInput.id = 'chatPhotoInput';
      photoInput.accept = 'image/*';
      photoInput.capture = 'environment'; // en mobile abre la cámara directo
      photoInput.hidden = true;
      photoInput.onchange = (e) => this.handlePhotoSelected(e);
      inner.appendChild(photoInput);

      const photoBtn = document.createElement('button');
      photoBtn.id = 'chatPhotoBtn';
      photoBtn.type = 'button';
      photoBtn.title = 'Mandar foto de ingredientes';
      photoBtn.style.cssText = 'background:none; border:none; font-size:20px; cursor:pointer; padding:0 6px; line-height:1; flex-shrink:0;';
      photoBtn.innerText = '📷';
      photoBtn.onclick = () => document.getElementById('chatPhotoInput').click();

      if (micBtnRef) inner.insertBefore(photoBtn, micBtnRef);
      else inner.appendChild(photoBtn);
    }

    if (Notifications.isEnabled()) Notifications.start();
  },
*/
