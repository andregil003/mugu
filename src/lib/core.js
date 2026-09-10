// Lógica pura: fechas, prescripción, semáforo, validación.
// NO importa React. Solo funciones puras (mismo input → mismo output).

import {
  PLAZO_IMPUTACION_DIAS,
  PLAZO_PAGO_DIAS,
  PLAZO_PRESCRIPCION_DIAS,
} from './constantes'

/**
 * Normaliza un nombre/entidad a un id tipo slug (p.ej. "EMETRA" → "emetra").
 * @param {string} nombre
 * @returns {string}
 */
export function normalizarEntidad(nombre = '') {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
}

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
 * Fecha de hoy en formato ISO (YYYY-MM-DD), local.
 * @returns {string}
 */
export function hoyISO() {
  const h = new Date()
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(
    h.getDate()
  ).padStart(2, '0')}`
}

/**
 * Devuelve la fecha (YYYY-MM-DD) resultante de sumar días a una fecha ISO.
 * @param {string} fechaISO ISO (YYYY-MM-DD)
 * @param {number} dias puede ser negativo
 * @returns {string}
 */
export function fechaMasDias(fechaISO, dias = 0) {
  if (!fechaISO) return ''
  const f = new Date(fechaISO)
  if (isNaN(f)) return fechaISO
  f.setDate(f.getDate() + dias)
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(
    f.getDate()
  ).padStart(2, '0')}`
}

/**
 * Días restantes (o transcurridos, si es negativo) hasta una fecha objetivo.
 * @param {string} fechaObjetivoISO ISO (YYYY-MM-DD)
 * @returns {number}
 */
export function diasRestantesPara(fechaObjetivoISO) {
  if (!fechaObjetivoISO) return 0
  const f = new Date(`${fechaObjetivoISO}T00:00:00`)
  const hoy = new Date(`${hoyISO()}T00:00:00`)
  return Math.round((f - hoy) / (1000 * 60 * 60 * 24))
}

/**
 * Formatea una fecha ISO a DD/MM/AAAA para mostrar.
 * @param {string} fechaISO
 * @returns {string}
 */
export function formatearFecha(fechaISO) {
  if (!fechaISO) return '—'
  const f = new Date(fechaISO)
  if (isNaN(f)) return fechaISO
  return `${String(f.getDate()).padStart(2, '0')}/${String(
    f.getMonth() + 1
  ).padStart(2, '0')}/${f.getFullYear()}`
}

/**
 * Fecha de hoy menos N días (útil para datos de demostración).
 * @param {number} dias
 * @returns {string}
 */
export function fechaHaceDias(dias) {
  return fechaMasDias(hoyISO(), -dias)
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

/**
 * Valida formato de placa guatemalteca (Acuerdo Gubernativo 487-2013 / SAT).
 * Formatos aceptados:
 *  - Con prefijo de tipo de vehículo: P123ABC, M123ABC, C1234ABC, TE123ABC,
 *    TRC1234ABC, CD123ABC, MT123ABC, DIS1234 … (1-3 letras + 3-4 dígitos + sufijo opcional de letras)
 *  - Sin prefijo (placas antiguas): 123ABC, 1234
 * Se toleran guiones y espacios (P-123ABC).
 * @param {string} placa
 * @returns {boolean}
 */
export function validarPlaca(placa) {
  if (!placa) return false
  const p = placa.trim().toUpperCase().replace(/[\s-]/g, '')
  return /^(?:[A-Z]{1,3}\d{3,4}[A-Z]{0,3}|\d{3,4}[A-Z]{0,3})$/.test(p)
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
 * Infiere el tipo de vehículo desde el prefijo de la placa guatemalteca
 * (Acuerdo 487-2013: P, A, C, TE, U, TRC, M, MT, TC, O, CD, CC, MI, DIS).
 * @param {string} placa
 * @returns {string} tipo de vehículo
 */
export function inferirTipoVehiculo(placa) {
  if (!placa) return 'otro'
  const p = placa.trim().toUpperCase().replace(/[\s-]/g, '')
  if (/^(CD|CC|MI)/.test(p)) return 'diplomatico'
  const prefijos = [
    'TRC',
    'DIS',
    'MT',
    'TC',
    'TE',
    'M',
    'A',
    'C',
    'U',
    'O',
    'P',
    'B',
    'T',
  ]
  const prefijo = prefijos.find((x) => p.startsWith(x))
  const tipos = {
    P: 'particular',
    M: 'motocicleta',
    MT: 'mototaxi',
    A: 'alquiler',
    C: 'comercial',
    U: 'urbano',
    TE: 'extraurbano',
    TC: 'remolque',
    TRC: 'agricola',
    O: 'oficial',
    CD: 'diplomatico',
    CC: 'consular',
    MI: 'mision_internacional',
    DIS: 'distribuidor',
    B: 'bus',
    T: 'taxi',
  }
  return prefijo ? (tipos[prefijo] ?? 'otro') : 'otro'
}