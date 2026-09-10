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

/**
 * Valida formato de placa guatemalteca: 3 letras + 3-4 números (P123ABC o P1234ABC).
 * @param {string} placa
 * @returns {boolean}
 */
export function validarPlaca(placa) {
  if (!placa) return false
  return /^[A-Za-z]{3}\d{3,4}$/.test(placa.trim())
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