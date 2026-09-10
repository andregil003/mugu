// pantalla_detalle_multa: destino final de búsquedas.
// Muestra: tabla de datos de la multa, motivo formal + lenguaje claro,
// línea de tiempo legal según fecha de emisión y fecha de notificación,
// situación actual y acciones (pagar / apelar / quitar la multa).
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n'
import {
  inferirTipoVehiculo,
  hoyISO,
  fechaMasDias,
  fechaHaceDias,
  formatearFecha,
  diasDesde,
  diasRestantesPara,
} from '@/lib/core'
import { cargarInfracciones, sincronizarCacheDiario } from '@/lib/data'
import {
  PLAZO_IMPUTACION_DIAS,
  PLAZO_PRESCRIPCION_DIAS,
} from '@/lib/constantes'

const TIPO_LABEL = {
  particular: 'tipoParticular',
  motocicleta: 'tipoMotocicleta',
  mototaxi: 'tipoMototaxi',
  alquiler: 'tipoAlquiler',
  comercial: 'tipoComercial',
  urbano: 'tipoUrbano',
  extraurbano: 'tipoExtraurbano',
  remolque: 'tipoRemolque',
  agricola: 'tipoAgricola',
  oficial: 'tipoOficial',
  diplomatico: 'tipoDiplomatico',
  consular: 'tipoConsular',
  mision_internacional: 'tipoMisionInternacional',
  distribuidor: 'tipoDistribuidor',
  bus: 'tipoBus',
  taxi: 'tipoTaxi',
  otro: 'tipoOtro',
}

// Explicaciones en lenguaje claro (provisional: se afinarán después)
const EXPLICACION = {
  semaforo_rojo:
    'Pasaste con el semáforo en rojo o ignoraste una señal de ALTO. Las cámaras o agentes de tránsito detectan esta falta y se registra automáticamente con tu placa.',
  estacionamiento_prohibido:
    'Estacionaste en una zona señalizada como prohibida (cerca de esquinas, pasos peatonales, rampas o con señal de no estacionar).',
  licencia_vencida:
    'Al momento del control, tu licencia de conducir estaba vencida. Conducir sin licencia vigente es una infracción al Reglamento de Tránsito.',
  sin_tarjeta_circulacion:
    'No llevabas la tarjeta de circulación vigente del vehículo; este documento acredita que el vehículo está registrado y al día.',
  basura_vehiculo:
    'Arrojaste basura, colillas u objetos desde el vehículo a la vía. Mantener limpio el entorno es parte de las normas de tránsito.',
  sin_placas:
    'El vehículo circulaba sin placas de matrícula o con placas que no correspondían al vehículo.',
  sin_casco_moto:
    'Circulabas en motocicleta sin casco protector ni chaleco reflectivo, que son obligatorios en Guatemala.',
  sobrecarga_vehiculo:
    'El vehículo llevaba más peso o pasajeros de los permitidos para su tipo.',
  sin_seguro:
    'No presentaste el seguro obligatorio vigente del vehículo al momento del control.',
  alterar_seguridad_transito:
    'Se modificaron señales, aceras, bordillos u otros elementos de seguridad vial sin autorización.',
  alcohol_drogas:
    'Conducías bajo los efectos de alcohol u otras drogas. Es una de las faltas más graves y puede incluir sanciones adicionales.',
  exceso_velocidad:
    'Circulabas a una velocidad mayor a la permitida para esa vía; la velocidad máxima se registra con radares o control de velocidad.',
  celular_conduciendo:
    'Usabas el teléfono u otro dispositivo móvil mientras conducías, lo cual reduce tu atención al volante.',
  sentido_contrario:
    'Circular en sentido contrario al indicado es una falta grave, aunque la vía lo permita por error o costumbre.',
  sin_luces_noche:
    'Circular de noche sin las luces encendidas o con el sistema de iluminación en mal estado.',
}

function normalizarEntidad(nombre = '') {
  return nombre.toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

function formatoMonto(monto) {
  const n = Number(String(monto ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? `Q${n.toFixed(2)}` : '—'
}

// Fase del proceso legal según fechas de emisión y notificación
function calcularEstado(fechaEmision, fechaNotif) {
  const prescrita = diasDesde(fechaEmision) > PLAZO_PRESCRIPCION_DIAS
  if (prescrita) return 'prescrita'
  if (diasDesde(fechaNotif) <= PLAZO_IMPUTACION_DIAS) return 'apelable'
  return 'soloPago'
}

const COLOR_FASE = {
  emitida: 'border-blue-500 text-blue-600 ring-blue-500/20',
  notificada: 'border-emerald-500 text-emerald-600 ring-emerald-500/20',
  apelacion: 'border-amber-500 text-amber-600 ring-amber-500/20',
  solopago: 'border-red-500 text-red-600 ring-red-500/20',
  prescripcion: 'border-violet-500 text-violet-600 ring-violet-500/20',
}

const SITUACION = {
  apelable: {
    clave: 'estadoApelable',
    caja: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    punto: 'bg-emerald-500',
  },
  soloPago: {
    clave: 'estadoSoloPago',
    caja: 'border-amber-200 bg-amber-50 text-amber-900',
    punto: 'bg-amber-500',
  },
  prescrita: {
    clave: 'estadoPrescrita',
    caja: 'border-red-200 bg-red-50 text-red-900',
    punto: 'bg-red-500',
  },
}

const DESCRIPCION = {
  apelable: 'estadoApelableDesc',
  soloPago: 'estadoSoloPagoDesc',
  prescrita: 'estadoPrescritaDesc',
}

export default function Detalle() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const placa = params.get('placa') ?? ''
  const entidad = params.get('entidad') ?? ''
  const fechaParam = params.get('fecha') ?? ''

  const [multa, setMulta] = useState(null)
  const [entidades, setEntidades] = useState([])
  const [razonFormal, setRazonFormal] = useState('')
  const [razonClara, setRazonClara] = useState('')
  const [fechaNotif, setFechaNotif] = useState(() => hoyISO())

  useEffect(() => {
    let activo = true
    async function cargar() {
      const [infracciones, listaEntidades, multas] = await Promise.all([
        cargarInfracciones().catch(() => []),
        fetch('/entidades.json')
          .then((r) => r.json())
          .then((d) => d.entidades ?? [])
          .catch(() => []),
        sincronizarCacheDiario().catch(() => []),
      ])
      if (!activo) return

      const real = multas.find(
        (m) =>
          String(m.placa ?? '').trim().toUpperCase() ===
            placa.trim().toUpperCase() &&
          (!entidad || normalizarEntidad(m.entidad) === entidad)
      )

      const multaFinal = real
        ? {
            noMulta: real.noMulta ?? real.numero ?? real.remision ?? '—',
            placa: real.placa ?? placa,
            tipoVehiculo:
              real.tipo_vehiculo ?? inferirTipoVehiculo(placa),
            entidad,
            fecha: real.fecha ?? fechaParam ?? fechaHaceDias(21),
            infraccion: real.infraccion ?? 'semaforo_rojo',
            monto: real.monto ?? 400,
            estado: real.estado ?? 'pendiente',
          }
        : {
            noMulta: '573391',
            placa,
            tipoVehiculo: inferirTipoVehiculo(placa),
            entidad,
            fecha: fechaParam || fechaHaceDias(21),
            infraccion: 'semaforo_rojo',
            monto: 400,
            estado: 'pendiente',
          }

      const inf = infracciones.find(
        (i) => i.id === multaFinal.infraccion
      )
      setRazonFormal(
        inf?.nombre ?? multaFinal.infraccion ?? 'Multa de tránsito'
      )
      setRazonClara(
        EXPLICACION[multaFinal.infraccion] ??
          'Esta infracción se registró sobre la placa del vehículo según la normativa de tránsito vigente.'
      )
      setMulta(multaFinal)
      setEntidades(listaEntidades)
    }
    cargar()
    return () => {
      activo = false
    }
  }, [placa, entidad, fechaParam])

  if (!multa) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <Card>
          <CardContent className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
            Cargando…
          </CardContent>
        </Card>
      </div>
    )
  }

  const tipo = multa.tipoVehiculo
  const tipoLabel = t(TIPO_LABEL[tipo] ?? 'tipoOtro')
  const entidadObj = entidades.find(
    (e) => e.id === entidad || normalizarEntidad(e.corto) === entidad
  )
  const entidadLabel = entidadObj?.corto ?? entidad.toUpperCase()

  // Fechas y plazos
  const fechaEmision = multa.fecha
  const fechaApelacionFin = fechaMasDias(fechaNotif, PLAZO_IMPUTACION_DIAS)
  const fechaPrescripcion = fechaMasDias(
    fechaEmision,
    PLAZO_PRESCRIPCION_DIAS
  )
  const diasParaPrescripcion = diasRestantesPara(fechaPrescripcion)

  // Situación
  const estado = calcularEstado(fechaEmision, fechaNotif)
  const pagada = multa.estado === 'pagada'
  const fase = pagada ? null : estado
  const situacion = SITUACION[fase]

  // Línea de tiempo
  const pasosPagada = ['emitida', 'notificada', 'apelacion', 'solopago']
  const pasos = pagada
    ? pasosPagada.map((id) => ({ id, clase: 'ok' }))
    : [
        { id: 'emitida', clase: 'ok' },
        { id: 'notificada', clase: 'ok' },
        {
          id: 'apelacion',
          clase:
            estado === 'prescrita' || estado === 'soloPago'
              ? 'ok'
              : estado === 'apelable'
                ? 'current'
                : 'pending',
        },
        {
          id: 'solopago',
          clase:
            estado === 'soloPago'
              ? 'current'
              : estado === 'prescrita'
                ? 'blocked'
                : 'pending',
        },
        {
          id: 'prescripcion',
          clase:
            estado === 'prescrita'
              ? 'current'
              : estado === 'apelable' || estado === 'soloPago'
                ? 'pending'
                : 'pending',
        },
      ]

  const DETALLE_PASO = {
    emitida: formatearFecha(fechaEmision),
    notificada: formatearFecha(fechaNotif),
    apelacion: `${t('vence')} ${formatearFecha(fechaApelacionFin)}`,
    solopago: t('tlSoloPagoDetalle'),
    prescripcion: `${t('prescribe')} ${formatearFecha(fechaPrescripcion)}`,
  }

  function nodoPaso(p) {
    if (p.clase === 'ok') return 'border-2 border-blue-600 bg-blue-600'
    if (p.clase === 'current') return `border-2 bg-white ring-4 ${COLOR_FASE[p.id]}`
    if (p.clase === 'blocked') return 'border-2 border-gray-200 bg-gray-200'
    return 'border-2 border-gray-300 bg-white'
  }

  const estadoTabla =
    multa.estado === 'pagada' ? t('estadoPagada') : t('estadoPendiente')

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Button
        variant="ghost"
        className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() =>
          navigate(`/resultados?placa=${encodeURIComponent(placa)}`)
        }
      >
        ← {t('volver')}
      </Button>

      {/* Encabezado */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 shadow-lg">
        <div className="px-5 py-5 text-white">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-100">
            {t('detalleTitulo')}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{multa.placa}</h1>
          <p className="mt-1 text-sm text-blue-100">
            {tipoLabel} · {entidadLabel} · {formatearFecha(fechaEmision)}
          </p>
        </div>
      </div>

      <Card className="mt-4 rounded-2xl shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="space-y-6 py-6">
          {/* Tabla de datos */}
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t('detalleTablaTitulo')}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">{t('detalleNoMulta')}</th>
                    <th className="px-3 py-2 font-semibold">{t('detallePlaca')}</th>
                    <th className="px-3 py-2 font-semibold">{t('detalleTipo')}</th>
                    <th className="px-3 py-2 font-semibold">{t('detalleEntidad')}</th>
                    <th className="px-3 py-2 font-semibold">{t('detalleFecha')}</th>
                    <th className="px-3 py-2 font-semibold">{t('detalleInfraccion')}</th>
                    <th className="px-3 py-2 font-semibold">{t('detalleMonto')}</th>
                    <th className="px-3 py-2 font-semibold">{t('detalleEstado')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50 last:border-0 even:bg-gray-50/50">
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">
                      {multa.noMulta}
                    </td>
                    <td className="px-3 py-2.5 font-semibold">{multa.placa}</td>
                    <td className="px-3 py-2.5">{tipoLabel}</td>
                    <td className="px-3 py-2.5">{entidadLabel}</td>
                    <td className="px-3 py-2.5">{formatearFecha(fechaEmision)}</td>
                    <td className="px-3 py-2.5 font-medium uppercase text-muted-foreground">
                      {multa.infraccion?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-3 py-2.5 font-mono font-semibold">
                      {formatoMonto(multa.monto)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          pagada
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {estadoTabla}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Razón formal + clara */}
          <section className="rounded-xl bg-gradient-to-b from-emerald-50 to-emerald-50/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              {t('razonFormal')}
            </p>
            <p className="mt-1 text-sm italic text-gray-400">{razonFormal}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-600">
              {t('razonClara')}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-gray-900">
              {razonClara}
            </p>
          </section>

          {/* Fechas y plazos */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t('notifTitulo')}
            </h2>
            <div>
              <label
                htmlFor="fechaRectificacion"
                className="mb-1 block text-sm font-medium"
              >
                {t('notifLabel')}
              </label>
              <Input
                id="fechaRectificacion"
                type="date"
                value={fechaNotif}
                min={fechaEmision || undefined}
                max={hoyISO()}
                onChange={(e) => setFechaNotif(e.target.value || hoyISO())}
                className="h-11 rounded-xl transition hover:border-blue-400 focus-visible:ring-blue-500/30"
              />
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {t('notifNota')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFechaNotif(hoyISO())}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  fechaNotif === hoyISO()
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                ✓ {t('notifHoy')}
              </button>
              <button
                type="button"
                onClick={() => fechaEmision && setFechaNotif(fechaEmision)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  fechaNotif === fechaEmision
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                ✓ {t('notifFisica')}
              </button>
            </div>
          </section>

          {/* Línea de tiempo */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t('tlTitulo')}
            </h2>
            <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
              {pasos.map((p, i) => (
                <div key={p.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${nodoPaso(
                        p
                      )}`}
                    >
                      {p.clase === 'current' && (
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-current" />
                      )}
                      {p.clase === 'blocked' && (
                        <span className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </span>
                    {i < pasos.length - 1 && (
                      <span
                        className={`my-1 w-0.5 flex-1 rounded-full ${
                          p.id === 'solopago' && estado === 'prescrita'
                            ? 'bg-red-200'
                            : p.clase === 'ok'
                              ? 'bg-blue-300'
                              : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className={`pb-6 ${i === pasos.length - 1 ? 'pb-0' : ''}`}>
                    <p
                      className={`text-sm font-semibold ${
                        p.clase === 'current' ? 'text-foreground' : 'text-foreground/80'
                      }`}
                    >
                      {t(`tl${p.id.charAt(0).toUpperCase()}${p.id.slice(1)}`)}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {DETALLE_PASO[p.id]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Prescripción */}
          {!pagada && (
            <div className="rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-sm text-violet-900">
              {estado === 'prescrita' ? (
                <>
                  <span className="font-semibold">{t('estadoPrescrita')}:</span>{' '}
                  {t('estadoPrescritaDesc')}{' '}
                  <span className="font-semibold">
                    {formatearFecha(fechaPrescripcion)}
                  </span>.
                </>
              ) : (
                <>
                  <span className="font-semibold">{t('tlPrescripcion')}:</span>{' '}
                  {diasParaPrescripcion > 0 ? (
                    <>
                      {t('prescribe')} el{' '}
                      <span className="font-semibold">
                        {formatearFecha(fechaPrescripcion)}
                      </span>{' '}
                      ({diasParaPrescripcion}{' '}
                      {diasParaPrescripcion === 1 ? 'día' : 'días'}).{' '}
                      {t('tlPrescripcionDetalle')}
                    </>
                  ) : (
                    <>
                      {t('prescribe')} el{' '}
                      <span className="font-semibold">
                        {formatearFecha(fechaPrescripcion)}
                      </span>. {t('tlPrescripcionDetalle')}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Situación actual */}
          {situacion && (
            <section
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${situacion.caja}`}
            >
              <span
                className={`mt-1 h-3 w-3 shrink-0 rounded-full animate-pulse ${situacion.punto}`}
              />
              <div>
                <p className="font-semibold">{t(situacion.clave)}</p>
                <p className="mt-0.5 text-sm leading-relaxed">
                  {t(DESCRIPCION[fase])}
                  {fase === 'apelable' && (
                    <> {t('vence')} el {formatearFecha(fechaApelacionFin)}.</>
                  )}
                </p>
              </div>
            </section>
          )}

          {/* Acciones */}
          <div className="space-y-2.5 pt-1">
            <Button
              size="lg"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
              onClick={() =>
                navigate(`/pago?placa=${encodeURIComponent(placa)}&entidad=${entidad}`)
              }
            >
              {t('botonPagar')}
            </Button>

            <Button
              variant="outline"
              size="lg"
              disabled={!fase || fase !== 'apelable' || pagada}
              className={`w-full rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                fase === 'apelable' && !pagada
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : ''
              }`}
              onClick={() =>
                navigate(`/apelacion?placa=${encodeURIComponent(placa)}&entidad=${entidad}`)
              }
            >
              {t('botonApelar')}
            </Button>
            {fase === 'soloPago' && !pagada && (
              <p className="text-center text-xs text-muted-foreground">
                {t('tlSoloPagoDetalle')}
              </p>
            )}

            <Button
              variant="ghost"
              disabled={pagada}
              className={`w-full rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                fase === 'prescrita'
                  ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'border border-red-100 text-red-600 hover:bg-red-50'
              }`}
              onClick={() =>
                navigate(`/apelacion?placa=${encodeURIComponent(placa)}&entidad=${entidad}`)
              }
            >
              {t('botonQuitarMulta')}
            </Button>
            {!pagada && (
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                {t('quitarMultaDesc')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}