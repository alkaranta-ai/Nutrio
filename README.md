# 🥑 Nutrio — Tu nutricionista personal

Una PWA (web app instalable) que funciona como tu nutricionista personal:
perfil nutricional propio, chat con un asistente de IA, recetas del día
pensadas para Latinoamérica, y un carrito de compras que se arma solo con
los ingredientes de tus recetas.

100% frontend: no necesita backend, base de datos ni claves de API.
Todos tus datos (perfil, historial, carrito) se guardan solo en tu
dispositivo, vía `localStorage`.

## 🚀 Publicar en GitHub Pages (gratis, 5 minutos)

1. Creá un repositorio nuevo en GitHub (público), por ejemplo `nutrio-app`.
2. Subí **todo el contenido de esta carpeta** (no la carpeta en sí, sino
   `index.html`, `manifest.json`, `sw.js`, `css/`, `js/`, `icons/`) a la
   raíz del repositorio.
   - Con git:
     ```bash
     cd nutriapp
     git init
     git add .
     git commit -m "Nutrio: mi nutricionista personal"
     git branch -M main
     git remote add origin https://github.com/TU_USUARIO/nutrio-app.git
     git push -u origin main
     ```
   - O arrastrando los archivos desde la web de GitHub ("Add file" →
     "Upload files").
3. En el repositorio: **Settings → Pages**.
4. En "Build and deployment", elegí **Deploy from a branch**, rama
   `main`, carpeta `/ (root)`. Guardá.
5. Esperá 1-2 minutos. Tu app va a quedar publicada en:
   `https://TU_USUARIO.github.io/nutrio-app/`

Listo, ese link ya es instalable.

## 📱 Instalar en el celular

**iPhone / iPad (Safari):**
1. Abrí el link de tu app en Safari (tiene que ser Safari, no Chrome).
2. Tocá el botón de compartir (el cuadrado con la flecha hacia arriba).
3. "Agregar a pantalla de inicio" → Agregar.

**Android (Chrome):**
1. Abrí el link en Chrome.
2. Va a aparecer un banner "Instalar app", o desde el menú ⋮ → "Instalar
   aplicación" / "Agregar a pantalla de inicio".

En ambos casos queda como un ícono más en tu pantalla de inicio, abre en
pantalla completa (sin la barra del navegador) y funciona sin conexión
gracias al service worker.

## 🧠 Cómo funciona el chat con IA

El chat es un asistente de reglas + base de datos nutricional que corre
100% en el navegador, sin necesitar conexión ni clave de API. Entiende:
- Consultas de calorías/macros de un alimento ("¿cuántas calorías tiene
  el aguacate?")
- Registro de comidas ("comí 2 huevos")
- Pedidos de recetas ("dame algo alto en proteína para la cena")
- Resumen del día ("¿cómo voy hoy?")
- Preguntas generales (agua, fibra, azúcar, sodio, vegetarianismo, subir
  o bajar de peso)

### ¿Querés un chat con un modelo de IA real (Claude) en vez de reglas?
Se puede conectar a la API de Anthropic, pero como esta app no tiene
backend, la clave de API quedaría expuesta en el navegador de quien la
use — no es seguro para una app pública. Si querés esa versión, la forma
correcta es agregar una función serverless (por ejemplo en Vercel o
Cloudflare Workers) que reciba el mensaje del usuario, llame a la API de
Anthropic con tu clave guardada del lado del servidor, y devuelva la
respuesta al chat. Avisame si querés que te arme ese backend.

## 🗂️ Estructura del proyecto

```
nutriapp/
├── index.html          # shell de la app + onboarding
├── manifest.json        # metadata de instalación PWA
├── sw.js                 # service worker (offline + caché)
├── css/styles.css        # estética "liquid glass"
├── js/
│   ├── data.js           # base de datos nutricional + recetas LatAm
│   ├── storage.js        # localStorage + cálculo de calorías/macros
│   ├── chat.js            # motor del asistente nutricional
│   └── app.js             # router, onboarding y renderizado de vistas
└── icons/                # íconos PWA en todos los tamaños necesarios
```

## ✏️ Personalizar

- **Agregar alimentos**: sumá objetos al array `FOODS` en `js/data.js`.
- **Agregar recetas**: sumá objetos al array `RECIPES` en el mismo
  archivo, referenciando ids de `FOODS`.
- **Cambiar colores**: todo el tema vive en las variables `:root` al
  inicio de `css/styles.css`.
- **Cambiar cómo se calculan las calorías objetivo**: función
  `calcTargets()` en `js/storage.js` (fórmula Mifflin-St Jeor).

## ⚠️ Aviso

La información nutricional es orientativa y educativa, no reemplaza la
consulta con un nutricionista o médico, especialmente si tenés
condiciones como diabetes, hipertensión u otras.
