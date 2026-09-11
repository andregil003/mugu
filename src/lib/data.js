// Carga de datos: infracciones.json + entidades.json
// Los JSON viven en /public y se cargan con fetch.
// Caché en localStorage (offline-first): multas 24h, catálogos 7 días.

// ============================================================
// BACKEND DEMO — Google Sheets + Apps Script
// Poné acá la URL del Web App (ver backend/apps-script.gs)
// ============================================================
const SHEETS_API_URL =
  import.meta.env.VITE_SHEETS_API_URL ??
  'https://script.google.com/macros/s/AKfycbwIaczpMJr-rI1VWDKGiD9kH7vQFQBP69SdioiQbqpcn4WSwR5jsHrEXGrfcTEpVDvL/exec';

// Cache en localStorage: 1 fetch por día (PWA offline-first)
const CACHE_KEY = 'mugu_cache';
const CACHE_KEY_VIEJA = 'multaclara_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const CATALOGO_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

/**
 * Sincroniza el cache diario: baja TODAS las multas del backend.
 * - Si ya se sincronizó hoy, no hace fetch (usa el cache).
 * - Si el fetch falla, usa el cache viejo (offline).
 * @returns {Promise<Array>} multas
 */
export async function sincronizarCacheDiario() {
  const cache = leerCache()

  // Cache fresco (menos de 24h) → usarlo sin pegarle al backend
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return cache.multas
  }

  // Sin URL configurada → cache o vacío
  if (!SHEETS_API_URL) {
    return cache ? cache.multas : []
  }

  try {
    const res = await fetch(SHEETS_API_URL)
    if (!res.ok) throw new Error('Backend no respondió')
    const data = await res.json()
    if (!data.ok) throw new Error(data.error || 'Error del backend')

    const multas = data.multas ?? []
    guardarCache(multas)
    return multas
  } catch {
    // Offline o backend caído → usar lo que tengamos
    return cache ? cache.multas : []
  }
}

/**
 * Consulta las multas de una placa (desde el cache diario, sin fetch).
 * @param {string} placa
 * @returns {Promise<Array>}
 */
export async function cargarMultasPorPlaca(placa) {
  const multas = await sincronizarCacheDiario()
  const p = placa.trim().toUpperCase()
  return multas.filter((m) => m.placa === p)
}

/**
 * Fuerza la actualización del cache (botón "Actualizar").
 */
export async function forzarActualizacion() {
  if (!SHEETS_API_URL) return []
  try {
    const res = await fetch(SHEETS_API_URL)
    const data = await res.json()
    if (data.ok) {
      guardarCache(data.multas ?? [])
      return data.multas
    }
    return []
  } catch {
    return leerCache()?.multas ?? []
  }
}

// ---------- helpers de cache ----------

function leerCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY) ?? localStorage.getItem(CACHE_KEY_VIEJA)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function guardarCache(multas) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), multas })
    )
    localStorage.removeItem(CACHE_KEY_VIEJA)
  } catch {
    // localStorage lleno: seguimos sin cache
  }
}

/**
 * Carga el catálogo de infracciones con caché local (7 días).
 * @returns {Promise<Array>}
 */
export async function cargarInfracciones() {
  const cache = leerCatalogo('mugu_infracciones')
  if (cache && Date.now() - cache.timestamp < CATALOGO_TTL_MS) {
    return cache.data
  }
  try {
    const res = await fetch('/infracciones.json')
    if (!res.ok) throw new Error('No se pudo cargar infracciones.json')
    const data = await res.json()
    const lista = data.infracciones ?? data
    guardarCatalogo('mugu_infracciones', lista)
    return lista
  } catch {
    return cache ? cache.data : []
  }
}

/**
 * Carga el catálogo de entidades con caché local (7 días).
 * @returns {Promise<Array>}
 */
export async function cargarEntidades() {
  const cache = leerCatalogo('mugu_entidades')
  if (cache && Date.now() - cache.timestamp < CATALOGO_TTL_MS) {
    return cache.data
  }
  try {
    const res = await fetch('/entidades.json')
    if (!res.ok) throw new Error('No se pudo cargar entidades.json')
    const data = await res.json()
    const lista = data.entidades ?? []
    guardarCatalogo('mugu_entidades', lista)
    return lista
  } catch {
    return cache ? cache.data : []
  }
}

function leerCatalogo(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function guardarCatalogo(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }))
  } catch {
    // localStorage lleno: seguimos sin cache
  }
}