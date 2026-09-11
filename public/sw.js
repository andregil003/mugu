/* MUGU — Service Worker (PWA)
 * Estrategia:
 * - Precache de la app shell (assets del build) al instalar
 * - Cache-first para assets (rápido + offline)
 * - Network-first para /infracciones.json y el backend (siempre fresco si hay red)
 * - Cache del backend: 24h (coincide con el cache de localStorage en data.js)
 */
const CACHE_SHELL = 'mugu-shell-v3'
const CACHE_DATA = 'mugu-data-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_SHELL).then((cache) => cache.addAll(['/', '/index.html']))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_SHELL && k !== CACHE_DATA)
            .map((k) => caches.delete(k))
        )
      )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Solo manejar GET
  if (e.request.method !== 'GET') return

  // Backend de Sheets: network-first con cache de respaldo (offline)
  if (url.origin !== self.location.origin) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_DATA).then((cache) => cache.put(e.request, copy))
          return res
        })
        .catch(() => caches.match(e.request))
    )
    return
  }

  // Datos locales (infracciones.json, entidades.json): network-first
  if (url.pathname.endsWith('.json')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE_DATA).then((cache) => cache.put(e.request, copy))
          return res
        })
        .catch(() => caches.match(e.request))
    )
    return
  }

  // Assets del build: cache-first
  e.respondWith(
    caches.match(e.request).then(
      (cached) =>
        cached ||
        fetch(e.request).then((res) => {
          const copy = res.clone()
          caches.open(CACHE_SHELL).then((cache) => cache.put(e.request, copy))
          return res
        })
    )
  )
})