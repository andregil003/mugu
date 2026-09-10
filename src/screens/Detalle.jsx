// pantalla_detalle_multa: destino final de búsquedas.
// Diseño responsive y apilado: tabla de datos → motivo legal + explicación clara →
// línea de tiempo horizontal → fecha de notificación → prescripción → situación → acciones.
// Muestras: navbar (logo MUGU) arriba y footer abajo.
// Contrato backend: tipo_multa (Papeleta/Cepo/Fotovelocímetro), motivo_legal,
// estado (pendiente/pagada/impugnada/prescrita), fecha_notificacion, infraccion.
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '@/lib/i18n'
import {
  inferirTipoVehiculo,
  hoyISO,
  fechaMasDias,
  fechaHaceDias,
  formatearFecha,
  diasDesde,
  diasRestantesPara,
  normalizarEntidad,
} from '@/lib/core'
import { cargarInfracciones, sincronizarCacheDiario } from '@/lib/data'
import {
  PLAZO_IMPUTACION_DIAS,
  PLAZO_PRESCRIPCION_DIAS,
} from '@/lib/constantes'
import ModuleLayout from '@/components/layout/ModuleLayout'

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

const TIPO_MULTA_LABEL = {
  PAPELETA: 'tipoMultaPapeleta',
  CEPO: 'tipoMultaCepo',
  FOTOVELOCIMETRO: 'tipoMultaFotovelocimetro',
  'FOTO-MULTA': 'tipoMultaFotovelocimetro',
}

const ESTADO_LABEL = {
  pendiente: 'estadoPendiente',
  pagada: 'estadoPagada',
  impugnada: 'estadoImpugnada',
  prescrita: 'estadoPrescrita',
}

const ESTADO_BADGE = {
  pendiente: 'bg-amber-100 text-amber-700',
  pagada: 'bg-emerald-100 text-emerald-700',
  impugnada: 'bg-blue-100 text-blue-700',
  prescrita: 'bg-violet-100 text-violet-700',
}

const TIPO_MULTA_BADGE = {
  PAPELETA: 'bg-amber-100 text-amber-700',
  CEPO: 'bg-gray-200 text-gray-700',
  FOTOVELOCIMETRO: 'bg-sky-100 text-sky-700',
  'FOTO-MULTA': 'bg-sky-100 text-sky-700',
}

function formatoMonto(monto) {
  const n = Number(String(monto ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? `Q${n.toFixed(2)}` : '—'
}

function normalizar(m, placa) {
  const tipoMulta = (m.tipoMulta ?? m.tipo_multa ?? 'PAPELETA').toUpperCase()
  return {
    noMulta: m.no_multa ?? m.noMulta ?? m.numero ?? m.remision ?? '—',
    placa: m.placa ?? placa,
    tipoVehiculo: m.tipoVehiculo ?? m.tipo_vehiculo ?? inferirTipoVehiculo(placa),
    entidad: m.entidad,
    fecha: m.fecha ?? fechaHaceDias(21),
    infraccion: m.infraccion ?? '',
    motivoLegal: m.motivo_legal ?? m.motivoLegal ?? '',
    monto: m.monto ?? 0,
    tipoMulta,
    esFoto: tipoMulta === 'FOTO-MULTA' || tipoMulta === 'FOTOVELOCIMETRO',
    estado: m.estado ?? 'pendiente',
    categoria: m.categoria ?? '',
    fechaNotificacion: m.fecha_notificacion ?? m.fechaNotificacion ?? '',
  }
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

const PASOS_LEGALES = [
  { id: 'emitida', clave: 'tlEmitida' },
  { id: 'notificada', clave: 'tlNotificada' },
  { id: 'apelacion', clave: 'tlApelacion' },
  { id: 'solopago', clave: 'tlSoloPago' },
  { id: 'prescripcion', clave: 'tlPrescripcion' },
]

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

const PANEL = 'rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md'

export default function Detalle() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const placa = params.get('placa') ?? ''
  const entidad = params.get('entidad') ?? ''
  const noMultaParam = params.get('noMulta') ?? ''
  const fechaParam = params.get('fecha') ?? ''

  const [multa, setMulta] = useState(null)
  const [noEncontrada, setNoEncontrada] = useState(false)
  const [entidades, setEntidades] = useState([])
  const [motivoLegal, setMotivoLegal] = useState('')
  const [razonClara, setRazonClara] = useState('')
  const [consejo, setConsejo] = useState('')
  const [fechaNotif, setFechaNotif] = useState(() => hoyISO())

  useEffect(() => {
    let activo = true
    async function cargar() {
      const [infracciones, listaEntidades, reales] = await Promise.all([
        cargarInfracciones().catch(() => []),
        fetch('/entidades.json')
          .then((r) => r.json())
          .then((d) => d.entidades ?? [])
          .catch(() => []),
        sincronizarCacheDiario().catch(() => []),
      ])
      if (!activo) return

      // Buscar la multa elegida (por noMulta) primero en datos reales
      const p = placa.trim().toUpperCase()
      const candidatas = reales.filter(
        (m) =>
          String(m.placa ?? '').trim().toUpperCase() === p &&
          (!entidad || normalizarEntidad(m.entidad) === entidad)
      )
      const seleccion =
        candidatas.find(
          (m) => String(m.no_multa ?? m.noMulta ?? m.numero ?? m.remision) === noMultaParam
        ) ?? candidatas[0]

      // El backend no devuelve esta multa: no inventar datos
      if (!seleccion) {
        setNoEncontrada(true)
        return
      }

      const elegida = normalizar({ ...seleccion, entidad }, placa)

      // Si el backend ya trae fecha_notificacion (p. ej. papeleta digitalizada),
      // se propone como fecha inicial de la línea de tiempo.
      if (elegida.fechaNotificacion) {
        const iso = String(elegida.fechaNotificacion).slice(0, 10)
        if (iso >= (elegida.fecha ?? '') && iso <= hoyISO()) {
          setFechaNotif(iso)
        }
      }

      const inf = infracciones.find((i) => i.id === elegida.infraccion)
      setMotivoLegal(
        elegida.motivoLegal ||
          (inf ? `ARTÍCULO ${inf.articulo}: ${inf.nombre}` : elegida.infraccion ?? 'Multa de tránsito')
      )
      setRazonClara(
        inf?.descripcion ??
          'Esta infracción se registró sobre la placa del vehículo según la normativa de tránsito vigente.'
      )
      setConsejo(inf?.consejo ?? '')
      setMulta(elegida)
      setEntidades(listaEntidades)
    }
    cargar()
    return () => {
      activo = false
    }
  }, [placa, entidad, noMultaParam, fechaParam])

  if (noEncontrada) {
    return (
      <ModuleLayout>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{t('errorNoEncontrado')}</p>
            <p className="mt-1">{t('errorNoEncontradoNota')}</p>
          </div>
        </div>
      </ModuleLayout>
    )
  }

  if (!multa) {
    return (
      <ModuleLayout>
        <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">
          Cargando…
        </div>
      </ModuleLayout>
    )
  }

  const tipo = multa.tipoVehiculo
  const tipoLabel = t(TIPO_LABEL[tipo] ?? 'tipoOtro')
  const entidadObj = entidades.find(
    (e) => e.id === entidad || normalizarEntidad(e.corto) === entidad
  )
  const entidadLabel = entidadObj?.corto ?? entidad.toUpperCase()

  const tipoMultaLabel = multa.tipoMulta
    ? t(TIPO_MULTA_LABEL[multa.tipoMulta] ?? 'tipoMultaPapeleta')
    : ''
  const estadoTabla = t(ESTADO_LABEL[multa.estado] ?? 'estadoPendiente')

  // Fechas y plazos
  const fechaEmision = multa.fecha
  const fechaApelacionFin = fechaMasDias(fechaNotif, PLAZO_IMPUTACION_DIAS)
  const fechaPrescripcion = fechaMasDias(fechaEmision, PLAZO_PRESCRIPCION_DIAS)
  const diasParaPrescripcion = diasRestantesPara(fechaPrescripcion)

  // Situación
  const estado = calcularEstado(fechaEmision, fechaNotif)
  const pagada = multa.estado === 'pagada'
  const fase = pagada ? null : estado
  const situacion = SITUACION[fase]

  // Línea de tiempo
  const estadoPaso = (id) => {
    if (pagada) return 'ok'
    if (id === 'emitida' || id === 'notificada') return 'ok'
    if (id === 'apelacion') {
      if (estado === 'apelable') return 'current'
      if (estado === 'soloPago' || estado === 'prescrita') return 'ok'
      return 'pending'
    }
    if (id === 'solopago') {
      if (estado === 'soloPago') return 'current'
      if (estado === 'prescrita') return 'blocked'
      return 'pending'
    }
    if (id === 'prescripcion') {
      return estado === 'prescrita' ? 'current' : 'pending'
    }
    return 'pending'
  }

  const subEtiqueta = (id) => {
    if (id === 'emitida') return formatearFecha(fechaEmision)
    if (id === 'notificada') return formatearFecha(fechaNotif)
    if (id === 'apelacion') return formatearFecha(fechaApelacionFin)
    if (id === 'solopago') return '—'
    return formatearFecha(fechaPrescripcion)
  }

  function nodoPaso(p) {
    if (p.clase === 'ok') return 'border-2 border-blue-600 bg-blue-600 text-white'
    if (p.clase === 'current') return `border-2 bg-white ring-4 ${COLOR_FASE[p.id]}`
    if (p.clase === 'blocked') return 'border-2 border-gray-200 bg-gray-200'
    return 'border-2 border-gray-300 bg-white'
  }

  const captionTimeline =
    fase === 'apelable'
      ? `${t('estadoApelableDesc')} ${t('vence')} el ${formatearFecha(fechaApelacionFin)}.`
      : fase === 'soloPago'
        ? t('estadoSoloPagoDesc')
        : fase === 'prescrita'
          ? t('estadoPrescritaDesc')
          : ''

  return (
    <ModuleLayout>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Button
          variant="ghost"
          className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
          onClick={() =>
            navigate(`/multas?placa=${encodeURIComponent(placa)}&entidad=${entidad}`)
          }
        >
          ← {t('volver')}
        </Button>

        {/* Encabezado */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 shadow-lg">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="relative px-6 py-7 text-white">
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">
              {t('detalleTitulo')}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold">{multa.placa}</h1>
              {tipoMultaLabel && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                  {tipoMultaLabel}
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${
                  pagada ? 'bg-emerald-500/80' : 'bg-amber-500/80'
                }`}
              >
                {estadoTabla}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/80">
              {tipoLabel} · {entidadLabel} · {formatearFecha(fechaEmision)}
            </p>
          </div>
        </div>

        {/* 1. Datos de la multa */}
        <section className="mt-5 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fuchsia-700">
            {t('detalleTablaTitulo')}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full min-w-[620px] table-auto text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-transparent text-[11px] uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2.5 font-semibold">{t('detalleNoMulta')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('detallePlaca')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('detalleTipo')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('detalleEntidad')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('detalleFecha')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('detalleTipoMulta')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('detalleMotivoLegal')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('detalleMonto')}</th>
                  <th className="px-3 py-2.5 font-semibold">{t('detalleEstado')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="align-top even:bg-gray-50/50">
                  <td className="px-3 py-3 font-mono text-xs font-semibold">{multa.noMulta}</td>
                  <td className="px-3 py-3 font-semibold">{multa.placa}</td>
                  <td className="px-3 py-3">{tipoLabel}</td>
                  <td className="px-3 py-3">{entidadLabel}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {formatearFecha(fechaEmision)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        TIPO_MULTA_BADGE[multa.tipoMulta] ??
                        (multa.esFoto ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700')
                      }`}
                    >
                      {tipoMultaLabel ||
                        (multa.esFoto ? t('tipoMultaFoto') : t('tipoMultaPapel'))}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[13px] font-medium leading-snug">
                    {multa.motivoLegal || motivoLegal}
                  </td>
                  <td className="px-3 py-3 font-mono font-semibold whitespace-nowrap">
                    {formatoMonto(multa.monto)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        ESTADO_BADGE[multa.estado] ?? 'bg-amber-100 text-amber-700'
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

        {/* 2. Motivo legal + explicación clara */}
        <section className="mt-4 rounded-3xl border border-emerald-100 bg-gradient-to-b from-emerald-50 to-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {t('razonFormal')}
          </p>
          <p className="mt-1 text-sm italic text-gray-400">{motivoLegal}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            {t('razonClara')}
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-gray-900">
            {razonClara}
          </p>
          {consejo && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-100/70 px-3 py-2 text-xs leading-relaxed text-emerald-900">
              <FontAwesomeIcon icon={faLightbulb} className="mt-0.5 shrink-0" />
              <span>{consejo}</span>
            </p>
          )}
        </section>

        {/* 3. Línea de tiempo horizontal */}
        <section className="mt-4 rounded-3xl border border-violet-100 bg-gradient-to-b from-violet-50 to-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-violet-700">
            {t('tlTitulo')}
          </h2>
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-[400px] items-start justify-between">
              {PASOS_LEGALES.map((p, i) => {
                const clase = estadoPaso(p.id)
                const previa = i > 0 ? estadoPaso(PASOS_LEGALES[i - 1].id) : null
                return (
                  <div key={p.id} className="relative flex flex-1 flex-col items-center text-center">
                    {i < PASOS_LEGALES.length - 1 && (
                      <span
                        className={`absolute left-1/2 top-[11px] h-0.5 w-full -translate-y-1/2 rounded-full ${
                          previa === 'ok'
                            ? 'bg-blue-400'
                            : previa === 'blocked'
                              ? 'bg-red-300'
                              : 'bg-gray-200'
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[10px] transition-all duration-300 ${nodoPaso(
                        { ...p, clase }
                      )}`}
                    >
                      {clase === 'current' && (
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-current" />
                      )}
                      {clase === 'ok' && <span className="font-bold">✓</span>}
                      {clase === 'blocked' && <span className="font-bold text-red-500">✕</span>}
                    </span>
                    <p
                      className={`mt-1.5 px-0.5 text-[11px] font-semibold leading-tight ${
                        clase === 'current'
                          ? 'text-foreground'
                          : clase === 'blocked'
                            ? 'text-gray-400'
                            : 'text-foreground/70'
                      }`}
                    >
                      {t(p.clave)}
                    </p>
                    <p className="mt-0.5 px-0.5 text-[10px] font-medium leading-tight text-muted-foreground">
                      {subEtiqueta(p.id)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
          {captionTimeline && (
            <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs leading-relaxed text-gray-700">
              {captionTimeline}
            </p>
          )}
        </section>

        {/* 4. Fecha de notificación */}
        <section className={PANEL}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-700">
            {t('notifTitulo')}
          </h2>
          <div className="space-y-2.5">
            <div
              className={`rounded-2xl border-l-4 p-3 text-xs transition ${
                multa.esFoto
                  ? 'border-sky-400 bg-sky-50/80'
                  : 'border-gray-200 bg-gray-50/80'
              }`}
            >
              <p className="font-bold text-sky-800">{t('tipoMultaFoto')}</p>
              <p className="mt-1 leading-relaxed text-sky-900/80">
                {t('notifFotoDesc')}
              </p>
            </div>
            <div
              className={`rounded-2xl border-l-4 p-3 text-xs transition ${
                multa.esFoto
                  ? 'border-gray-200 bg-gray-50/80'
                  : 'border-amber-400 bg-amber-50/80'
              }`}
            >
              <p className="font-bold text-amber-800">{t('tipoMultaPapel')}</p>
              <p className="mt-1 leading-relaxed text-amber-900/80">
                {t('notifFisicaDesc')}
              </p>
            </div>
          </div>

          <label
            htmlFor="fechaNotificacion"
            className="mt-4 block text-sm font-medium"
          >
            {t('notifLabel')}
          </label>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Input
              id="fechaNotificacion"
              type="date"
              value={fechaNotif}
              min={fechaEmision || undefined}
              max={hoyISO()}
              onChange={(e) => setFechaNotif(e.target.value || hoyISO())}
              className="h-11 w-full max-w-[200px] rounded-xl transition hover:border-fuchsia-400 focus-visible:ring-fuchsia-500/30"
            />
            <button
              type="button"
              onClick={() => setFechaNotif(hoyISO())}
              className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                fechaNotif === hoyISO()
                  ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700'
                  : 'border-gray-200 text-gray-500 hover:border-fuchsia-300 hover:text-fuchsia-600'
              }`}
            >
              ✓ {t('notifHoy')}
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t('notifNota')}
          </p>
        </section>

        {/* 5. Prescripción */}
        {!pagada && (
          <section
            className={`mt-4 rounded-3xl border p-4 text-sm shadow-sm ${
              estado === 'prescrita'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-violet-100 bg-white text-violet-900'
            }`}
          >
            <p className="font-semibold">{t('tlPrescripcion')}</p>
            <p className="mt-1 text-xs leading-relaxed">
              {estado === 'prescrita' ? (
                <>
                  {t('estadoPrescritaDesc')}{' '}
                  <span className="font-semibold">
                    {formatearFecha(fechaPrescripcion)}
                  </span>.
                </>
              ) : (
                <>
                  {t('tlPrescripcionDetalle')} {t('prescribe')} el{' '}
                  <span className="font-semibold">
                    {formatearFecha(fechaPrescripcion)}
                  </span>{' '}
                  ({diasParaPrescripcion}{' '}
                  {diasParaPrescripcion === 1 ? 'día' : 'días'}).
                </>
              )}
            </p>
          </section>
        )}

        {/* 6. Situación actual */}
        {situacion && (
          <section
            className={`flex items-start gap-3 rounded-3xl border px-4 py-3 shadow-sm ${situacion.caja}`}
          >
            <span
              className={`mt-1 h-3 w-3 shrink-0 animate-pulse rounded-full ${situacion.punto}`}
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

        {/* 7. Acciones */}
        <section className="mt-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="space-y-2.5">
            <Button
              size="lg"
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-sm font-bold shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
              onClick={() =>
                navigate(
                  `/pago?placa=${encodeURIComponent(placa)}&entidad=${entidad}`
                )
              }
            >
              {t('botonPagar')}
            </Button>

            <Button
              variant="outline"
              size="lg"
              disabled={!fase || fase !== 'apelable' || pagada}
              className={`w-full rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] ${
                fase === 'apelable' && !pagada
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : ''
              }`}
              onClick={() =>
                navigate(
                  `/apelacion?placa=${encodeURIComponent(placa)}&entidad=${entidad}`
                )
              }
            >
              {t('botonApelar')}
            </Button>
            {fase === 'soloPago' && !pagada && (
              <p className="text-center text-xs text-muted-foreground">
                {t('estadoSoloPagoDesc')}
              </p>
            )}

            <Button
              variant="ghost"
              disabled={pagada}
              className={`w-full rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] ${
                fase === 'prescrita'
                  ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'border border-red-100 text-red-600 hover:bg-red-50'
              }`}
              onClick={() =>
                navigate(
                  `/apelacion?placa=${encodeURIComponent(placa)}&entidad=${entidad}`
                )
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
        </section>
      </div>
    </ModuleLayout>
  )
}