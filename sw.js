// v2: antes esto era "cache-first" para JS/CSS con un CACHE_NAME que nunca
// cambiaba ("nutrio-cache-v1"). Resultado: una vez que el navegador guardaba
// js/app.js en caché, lo servía SIEMPRE desde ahí, para siempre, sin importar
// cuántas veces actualizáramos el archivo en GitHub. Por eso los cambios de
// los chips (actividad, salud, restricciones) no se veían en el celular/PC
// de los usuarios que ya habían abierto la app antes.
//
// Cambios:
// 1) CACHE_NAME pasa a "v2" -> fuerza a borrar la caché vieja una sola vez.
// 2) Network-first para TODO (HTML, JS, CSS): siempre se intenta traer la
//    versión más nueva del servidor primero, y solo se usa la caché como
//    respaldo si no hay conexión. Así, cada vez que subís un cambio, se ve
//    apenas el usuario vuelve a abrir la app con internet.
//
// IMPORTANTE: cada vez que hagas un cambio grande a futuro y quieras
// asegurarte de que se vea sí o sí, subí el número de CACHE_NAME (v3, v4...).

const CACHE_NAME = "nutrio-cache-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/data.js",
  "./js/storage.js",
  "./js/chat.js",
  "./js/app.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: network-first para todo. Si hay internet, siempre se usa la
// versión más nueva del servidor (y se actualiza la caché de paso). Si no hay
// internet, se cae a lo último que quedó guardado, para que la app siga
// funcionando offline.
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === "navigate") return caches.match("./index.html");
          return undefined;
        })
      )
  );
});
