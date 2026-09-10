// Carga de datos: infracciones.json + entidades.json
// Los JSON viven en /public y se cargan con fetch.

// ============================================================
// BACKEND DEMO — Google Sheets + Apps Script
// Poné acá la URL del Web App (ver backend/apps-script.gs)
// ============================================================
const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbwIaczpMJr-rI1VWDKGiD9kH7vQFQBP69SdioiQbqpcn4WSwR5jsHrEXGrfcTEpVDvL/exec';

// Cache en localStorage: 1 fetch por día (PWA offline-first)
const CACHE_KEY = 'multaclara_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

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
    const raw = localStorage.getItem(CACHE_KEY)
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
  } catch {
    // localStorage lleno: seguimos sin cache
  }
}

export async function cargarInfracciones() {
  const res = await fetch('/infracciones.json')
  if (!res.ok) throw new Error('No se pudo cargar infracciones.json')
  return res.json()
}