// pantalla_pago: pasarela de pago SIMULADA (prototipo educativo) + canales reales.
// La app NO procesa pagos reales: el formulario es una simulación visual.
// Opción secundaria: redirigir al portal oficial de la entidad que emitió la multa.
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBuildingColumns,
  faCircleCheck,
  faCircleInfo,
  faCreditCard,
  faHandHoldingDollar,
  faLandmark,
  faLightbulb,
  faLock,
  faChevronLeft,
  faArrowUpRightFromSquare,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '@/lib/i18n'
import { normalizarEntidad, calcularMontoConRecargo } from '@/lib/core'
import { sincronizarCacheDiario } from '@/lib/data'
import ContactoEntidad from '@/components/ContactoEntidad'

// Bancos autorizados según la entidad que emitió la multa.
// Fuente: public/entidades.json (campos pagoEnLinea/pagoPresencial) + verificación SAT.
const BANCOS_POR_ENTIDAD = {
  pnc: ['pagoBancosSistema'],
  emetra: ['pagoBanrural'],
  emixtra: ['pagoBancoIndustrial'],
  santa_catarina_pinula: ['pagoBancoIndustrial'],
}

const PASOS = ['pagoPaso1', 'pagoPaso2', 'pagoPaso3', 'pagoPaso4', 'pagoPaso5']

// Monto de demostración si la multa no aparece en el caché local.
const MONTO_DEMO = 250

function formatearTarjeta(v) {
  return v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatearVencimiento(v) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export default function Pago() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const placa = params.get('placa') ?? ''
  const entidad = params.get('entidad') ?? ''
  const noMulta = params.get('noMulta') ?? ''
  const fechaNotif = params.get('fechaNotif') ?? ''

  const [portal, setPortal] = useState('')
  const [entidadLabel, setEntidadLabel] = useState(entidad.toUpperCase())
  const [entidadObj, setEntidadObj] = useState(null)
  const [monto, setMonto] = useState(null)

  const [tarjeta, setTarjeta] = useState('')
  const [titular, setTitular] = useState('')
  const [vencimiento, setVencimiento] = useState('')
  const [cvv, setCvv] = useState('')
  const [estado, setEstado] = useState('form') // form | procesando | exito

  useEffect(() => {
    let activo = true
    async function cargar() {
      const [entidades, reales] = await Promise.all([
        fetch('/entidades.json')
          .then((r) => r.json())
          .then((d) => d.entidades ?? [])
          .catch(() => []),
        sincronizarCacheDiario().catch(() => []),
      ])
      if (!activo) return

      const e = entidades.find(
        (x) =>
          x.id === entidad ||
          normalizarEntidad(x.corto) === normalizarEntidad(entidad)
      )
      if (e) {
        setEntidadLabel(e.corto ?? e.nombre ?? entidad.toUpperCase())
        setPortal(e.portal ?? '')
        setEntidadObj(e)
      }

      const p = placa.trim().toUpperCase()
      const multa = reales.find(
        (m) =>
          String(m.placa ?? '').trim().toUpperCase() === p &&
          (!entidad || normalizarEntidad(m.entidad) === normalizarEntidad(entidad))
      )
      if (multa) {
        const n = Number(String(multa.monto ?? '').replace(/[^0-9.]/g, ''))
        if (Number.isFinite(n) && n > 0) setMonto(n)
      }
    }
    cargar()
    return () => {
      activo = false
    }
  }, [placa, entidad])

  const bancos =
    BANCOS_POR_ENTIDAD[entidad] ?? [
      'pagoBanrural',
      'pagoBancoIndustrial',
      'pagoBancosSistema',
    ]
  const montoBase = monto ?? MONTO_DEMO
  const montoMostrado = calcularMontoConRecargo(montoBase, fechaNotif)
  const hayRecargo = montoMostrado > montoBase
  const portalUrl = entidadObj?.pagoEnLinea?.url || portal
  const formularioCompleto =
    tarjeta.replace(/\s/g, '').length === 16 &&
    titular.trim().length > 0 &&
    vencimiento.length === 5 &&
    cvv.length >= 3

  function pagar(e) {
    e.preventDefault()
    if (!formularioCompleto || estado === 'procesando') return
    setEstado('procesando')
    setTimeout(() => setEstado('exito'), 1800)
  }

  function reiniciar() {
    setTarjeta('')
    setTitular('')
    setVencimiento('')
    setCvv('')
    setEstado('form')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Button
        variant="ghost"
        className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() =>
          navigate(
            `/detalle?placa=${encodeURIComponent(placa)}&entidad=${encodeURIComponent(
              entidad
            )}${noMulta ? `&noMulta=${encodeURIComponent(noMulta)}` : ''}`
          )
        }
      >
        <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
        {t('volver')}
      </Button>

      {/* Encabezado */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 shadow-lg">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
        <div className="relative px-6 py-7 text-white">
          <p className="text-xs font-medium uppercase tracking-widest text-white/70">
            {t('pagoTitulo')}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{t('pagoSubtitulo')}</h1>
          <p className="mt-1 text-sm text-white/80">{t('pagoTexto')}</p>
        </div>
      </div>

      {/* Pasarela de pago simulada */}
      <section className="mt-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-border dark:bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white px-5 py-4 dark:border-border dark:from-emerald-950/30 dark:to-card">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              {t('pagoPasarelaTitulo')}
            </h2>
            <p className="text-xs text-muted-foreground">{t('pagoPasarelaSubtitulo')}</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
            <FontAwesomeIcon icon={faLock} className="h-3 w-3" />
            {t('pagoSimulacionNota')}
          </span>
        </div>

        {estado === 'exito' ? (
          <div className="px-5 py-10 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCircleCheck} className="h-8 w-8" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-foreground">{t('pagoExito')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t('pagoExitoDesc')}</p>
            <Button variant="outline" className="mt-5" onClick={reiniciar}>
              {t('pagoNuevaSimulacion')}
            </Button>
          </div>
        ) : (
          <form onSubmit={pagar} className="px-5 py-4">
            {/* Datos de la multa */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 dark:border-border dark:bg-muted/50">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('pagoDatosMulta')}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('detallePlaca')}
                  </p>
                  <p className="font-mono font-semibold">{placa}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('detalleEntidad')}
                  </p>
                  <p className="font-medium">{entidadLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('pagoBancoAsociado')}
                  </p>
                  <p className="flex items-center gap-1.5 font-medium">
                    <FontAwesomeIcon
                      icon={faBuildingColumns}
                      className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
                    />
                    {t(bancos[0])}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('pagoMonto')}
                  </p>
                  <p className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-400">
                    Q{montoMostrado.toFixed(2)}
                  </p>
                  {hayRecargo && (
                    <>
                      <p className="text-[10px] text-muted-foreground line-through">
                        {t('montoOriginal')}: Q{montoBase.toFixed(2)}
                      </p>
                      <p className="text-[9px] leading-snug text-emerald-700/80 dark:text-emerald-400/80">
                        {t('recargoAnual')}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Formulario de tarjeta */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t('pagoNumeroTarjeta')}
                </label>
                <Input
                  value={tarjeta}
                  onChange={(e) => setTarjeta(formatearTarjeta(e.target.value))}
                  placeholder={t('pagoTarjetaPlaceholder')}
                  inputMode="numeric"
                  className="h-11 font-mono"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t('pagoNombreTitular')}
                </label>
                <Input
                  value={titular}
                  onChange={(e) => setTitular(e.target.value.toUpperCase())}
                  placeholder="JUAN PEREZ"
                  className="h-11"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t('pagoVencimiento')}
                  </label>
                  <Input
                    value={vencimiento}
                    onChange={(e) => setVencimiento(formatearVencimiento(e.target.value))}
                    placeholder="MM/AA"
                    inputMode="numeric"
                    className="h-11 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t('pagoCvv')}</label>
                  <Input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder={t('pagoCvvPlaceholder')}
                    inputMode="numeric"
                    type="password"
                    className="h-11 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={!formularioCompleto || estado === 'procesando'}
              className="mt-4 w-full rounded-2xl bg-primary text-sm font-bold shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
            >
              {estado === 'procesando' ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                  {t('pagoProcesando')}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCreditCard} className="h-4 w-4" />
                  {t('pagoBotonPagar')}
                </>
              )}
            </Button>

            {/* Opción secundaria: portal oficial de la entidad */}
            {portalUrl && (
              <div className="mt-3 rounded-2xl border border-dashed border-gray-200 p-3 text-center dark:border-border">
                <p className="text-xs font-semibold text-gray-700 dark:text-foreground/80">{t('pagoPortalOficial')}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {entidadObj?.pagoEnLinea?.descripcion ?? t('pagoPortalOficialDesc')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => window.open(portalUrl, '_blank', 'noopener,noreferrer')}
                >
                  {entidadLabel}
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </form>
        )}
      </section>

      {/* Nota de descuento */}
      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900 dark:border-emerald-950/50 dark:bg-emerald-950/30 dark:text-emerald-400">
        <FontAwesomeIcon icon={faLightbulb} className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t('pagoNotaDescuento')}</span>
      </div>

      {/* Pasos */}
      <section className="mt-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-border dark:bg-card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          {t('pagoPasosTitulo')}
        </h2>
        <ol className="space-y-2.5">
          {PASOS.map((clave, i) => (
            <li key={clave} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-emerald-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-foreground/80">{t(clave)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Bancos autorizados */}
      <section className="mt-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-border dark:bg-card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          {t('pagoBancosTitulo')}
        </h2>
        <div className="space-y-2.5">
          {bancos.map((clave) => (
            <div
              key={clave}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 px-3 py-2.5 dark:border-border dark:bg-muted/50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <FontAwesomeIcon icon={faBuildingColumns} className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-gray-800 dark:text-foreground">{t(clave)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Canales */}
      <section className="mt-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-border dark:bg-card">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-2xl border-l-4 border-emerald-400 bg-emerald-50/60 p-3 dark:border-emerald-500 dark:bg-emerald-950/30">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-400">
              <FontAwesomeIcon icon={faCreditCard} className="h-3.5 w-3.5" />
              {t('pagoEnLinea')}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-400/80">
              {t('pagoEnLineaDesc')}
            </p>
          </div>
          <div className="rounded-2xl border-l-4 border-sky-400 bg-sky-50/60 p-3 dark:border-sky-500 dark:bg-sky-950/30">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-800 dark:text-sky-400">
              <FontAwesomeIcon icon={faHandHoldingDollar} className="h-3.5 w-3.5" />
              {t('pagoPresencial')}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-sky-900/80 dark:text-sky-400/80">
              {t('pagoPresencialDesc')}
            </p>
          </div>
        </div>
        <div className="mt-2.5 rounded-2xl border-l-4 border-amber-400 bg-amber-50/60 p-3 dark:border-amber-500 dark:bg-amber-950/30">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-400">
            <FontAwesomeIcon icon={faLandmark} className="h-3.5 w-3.5" />
            {t('pagoPortalSAT')}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/80 dark:text-amber-400/80">
            {t('pagoPortalSATDesc')}
          </p>
        </div>
      </section>

      {/* Contacto de la entidad (fuente: contactos SAT + tabla de pagos) */}
      <ContactoEntidad entidad={entidadObj} />

      {/* Disclaimer */}
      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-muted-foreground dark:border-border dark:bg-muted/50">
        <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t('pagoNoOficial')}</span>
      </div>
    </div>
  )
}