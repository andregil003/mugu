// Lógica pura: fechas, prescripción, semáforo, validación.
// NO importa React. Solo funciones puras (mismo input → mismo output).

import {
  PLAZO_IMPUTACION_DIAS,
  PLAZO_PAGO_DIAS,
  PLAZO_PRESCRIPCION_DIAS,
} from './constantes'

/**
 * Días transcurridos desde la fecha de la infracción hasta hoy.
 * @param {string} fechaInfraccion ISO (YYYY-MM-DD)
 * @returns {number} días transcurridos (0 si la fecha es inválida o futura)
 */
export function diasDesde(fechaInfraccion) {
  if (!fechaInfraccion) return 0
  const fecha = new Date(fechaInfraccion)
  if (isNaN(fecha)) return 0
  const hoy = new Date()
  const diff = hoy - fecha
  if (diff < 0) return 0
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Semáforo de legalidad según los días transcurridos.
 * @param {string} fechaInfraccion ISO (YYYY-MM-DD)
 * @returns {{ color: 'verde'|'amarillo'|'rojo', dias: number, motivo: string }}
 */
export function calcularSemaforo(fechaInfraccion) {
  const dias = diasDesde(fechaInfraccion)

  if (dias > PLAZO_PRESCRIPCION_DIAS) {
    return {
      color: 'rojo',
      dias,
      motivo: `Han pasado ${dias} días (> ${PLAZO_PRESCRIPCION_DIAS}). La multa podría haber prescrito.`,
    }
  }
  if (dias > PLAZO_IMPUTACION_DIAS) {
    return {
      color: 'amarillo',
      dias,
      motivo: `Han pasado ${dias} días. Todavía podés pagar con descuento (${PLAZO_PAGO_DIAS} días), pero revisá si podés impugnar.`,
    }
  }
  return {
    color: 'verde',
    dias,
    motivo: `Han pasado ${dias} días. Estás dentro del plazo de impugnación (${PLAZO_IMPUTACION_DIAS} días).`,
  }
}

/**
 * ¿Puede impugnar por oposición? (dentro de los primeros 15 días)
 * @param {string} fechaInfraccion ISO (YYYY-MM-DD)
 * @returns {boolean}
 */
export function puedeOposicion(fechaInfraccion) {
  return diasDesde(fechaInfraccion) <= PLAZO_IMPUTACION_DIAS
}

/**
 * ¿Puede alegar prescripción? (más de 120 días)
 * @param {string} fechaInfraccion ISO (YYYY-MM-DD)
 * @returns {boolean}
 */
export function puedePrescripcion(fechaInfraccion) {
  return diasDesde(fechaInfraccion) > PLAZO_PRESCRIPCION_DIAS
}

// Siglas de placa de Guatemala y su tipo de vehículo (lista oficial).
export const SIGLAS_PLACA = [
  { sigla: 'P', tipo: 'Particular' },
  { sigla: 'M', tipo: 'Motocicleta' },
  { sigla: 'A', tipo: 'Alquiler' },
  { sigla: 'C', tipo: 'Comercial, transporte extraurbano de personas o carga y escolar' },
  { sigla: 'TE', tipo: 'Transporte extraurbano de personas o carga' },
  { sigla: 'U', tipo: 'Transporte urbano' },
  { sigla: 'TRC', tipo: 'Agrícola, industrial o de construcción' },
  { sigla: 'MT', tipo: 'Mototaxis o similares' },
  { sigla: 'TC', tipo: 'Remolques y semirremolques' },
  { sigla: 'O', tipo: 'Oficial' },
  { sigla: 'CD', tipo: 'Cuerpo o misión diplomática' },
  { sigla: 'CC', tipo: 'Cuerpo o misión consular' },
  { sigla: 'MI', tipo: 'Organismos, ONG extranjeras, misiones o funcionarios internacionales' },
]

/**
 * Valida formato de placa guatemalteca: TIPO + 3 números + 3 letras (ej. P123ABC).
 * El TIPO debe ser una sigla existente de la lista oficial.
 * @param {string} placa
 * @returns {boolean}
 */
export function validarPlaca(placa) {
  if (!placa) return false
  const m = /^([A-Z]{1,3})(\d{3})([A-Z]{3})$/i.exec(placa.trim())
  if (!m) return false
  return SIGLAS_PLACA.some((s) => s.sigla === m[1].toUpperCase())
}

/**
 * ¿La sigla existe en la lista oficial de tipos de placa?
 * @param {string} sigla
 * @returns {boolean}
 */
export function validarSigla(sigla) {
  return SIGLAS_PLACA.some((s) => s.sigla === sigla)
}

/**
 * Compone la placa completa a partir de la sigla y el resto digitado.
 * @param {string} sigla ej. "P" o "CD"
 * @param {string} resto ej. "123 abc"
 * @returns {string} ej. "P123ABC"
 */
export function componerPlaca(sigla, resto) {
  const s = (sigla || '').trim().toUpperCase()
  const r = (resto || '').toString().trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  return `${s}${r}`
}

// ============================================================
// VALIDACIÓN INTERNA (demo) — sin base de datos por ahora.
// Solo la placa + número de multa de los placeholders hace match.
// ============================================================
const MULTAS_DEMO_INTERNAS = [
  { placa: 'P123ABC', no_multa: '123456' },
]

/**
 * Match local placa + número de multa (mientras no haya backend).
 * @param {string} placa
 * @param {string} noMulta
 * @returns {boolean}
 */
export function coincideMultaLocal(placa, noMulta) {
  const p = (placa || '').toString().trim().toUpperCase()
  const n = (noMulta || '').toString().trim()
  return MULTAS_DEMO_INTERNAS.some((m) => m.placa === p && m.no_multa === n)
}

/**
 * Valida que la fecha no sea futura.
 * @param {string} fecha ISO (YYYY-MM-DD)
 * @returns {boolean}
 */
export function validarFechaNoFutura(fecha) {
  if (!fecha) return false
  const f = new Date(fecha)
  return !isNaN(f) && f <= new Date()
}

/**
 * Infiere el tipo de vehículo desde el prefijo de la placa guatemalteca.
 * P=particular, M=moto, C=comercial, B=bus, T=taxi, O=oficial, CD=diplomático.
 * @param {string} placa
 * @returns {string} tipo de vehículo
 */
export function inferirTipoVehiculo(placa) {
  if (!placa) return 'otro'
  const p = placa.trim().toUpperCase()
  if (p.startsWith('CD')) return 'diplomatico'
  const prefijo = p[0]
  const tipos = {
    P: 'particular',
    M: 'moto',
    C: 'comercial',
    B: 'bus',
    T: 'taxi',
    O: 'oficial',
  }
  return tipos[prefijo] ?? 'otro'
}