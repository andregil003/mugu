// Capa de datos de demostración para el módulo "Buscar mis multas".
// Cuando el backend de Google Sheets aún no devuelve multas, se usa este mock
// para que el flujo completo se pueda probar (badges de municipios, listado, detalle).

import { fechaHaceDias, inferirTipoVehiculo, normalizarEntidad } from './core'

// Conteo de multas pendientes por entidad (para los badges del listado de municipios)
export const MOCK_MULTAS = { emetra: 2, pnc: 1, emixtra: 1 }

// Semilla de multas demo por entidad
const SEED = {
  emetra: [
    { noMulta: '573391', infraccion: 'semaforo_rojo', dias: 21, monto: 400 },
    { noMulta: '574218', infraccion: 'estacionamiento_prohibido', dias: 45, monto: 400 },
  ],
  pnc: [
    { noMulta: 'PNC-88213', infraccion: 'exceso_velocidad', dias: 10, monto: 500 },
  ],
  emixtra: [
    { noMulta: 'EMX-9912', infraccion: 'celular_conduciendo', dias: 90, monto: 300 },
  ],
}

/**
 * Genera las multas de demostración para una placa + entidad.
 * @param {string} placa
 * @param {string} entidad
 * @returns {Array<object>}
 */
export function multasDemo(placa, entidad) {
  const lista = SEED[entidad] ?? []
  return lista.map((s) => ({
    ...s,
    placa: (placa || '').trim().toUpperCase(),
    entidad,
    tipoVehiculo: inferirTipoVehiculo(placa),
    fecha: fechaHaceDias(s.dias),
    tipoMulta: 'PAPELETA',
    estado: 'pendiente',
  }))
}

/**
 * Devuelve las multas pendientes visibles para placa+entidad:
 * si el backend tiene datos usa esos; si no, usa la demo.
 * @param {string} placa
 * @param {string} entidad
 * @param {Array<object>} [reales] multas del backend
 * @returns {Array<object>}
 */
export function listarMultas(placa, entidad, reales = []) {
  const p = (placa || '').trim().toUpperCase()
  const pendientes = reales.filter(
    (m) =>
      String(m.placa ?? '').trim().toUpperCase() === p &&
      normalizarEntidad(m.entidad) === entidad &&
      m.estado !== 'pagada'
  )
  if (pendientes.length > 0) {
    return pendientes.map((m) => ({
      noMulta: m.no_multa ?? m.noMulta ?? m.numero ?? m.remision ?? '—',
      placa: m.placa ?? placa,
      entidad,
      tipoVehiculo: m.tipo_vehiculo ?? inferirTipoVehiculo(placa),
      fecha: m.fecha ?? '',
      infraccion: m.infraccion ?? 'semaforo_rojo',
      monto: m.monto ?? 0,
      tipoMulta: (m.tipo_multa ?? m.tipo ?? 'PAPELETA').toUpperCase(),
      estado: m.estado ?? 'pendiente',
      categoria: m.categoria ?? '',
      fechaNotificacion:
        m.fecha_notificacion ?? m.fechaNotificacion ?? '',
    }))
  }
  return multasDemo(placa, entidad)
}