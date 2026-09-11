// pantalla_pago: cómo pagar la multa — canales, bancos por entidad y pasos.
// Constraint del reto: la app NO procesa pagos; solo orienta dónde y cómo pagar.
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBuildingColumns,
  faCircleInfo,
  faCreditCard,
  faHandHoldingDollar,
  faLandmark,
  faLightbulb,
} from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '@/lib/i18n'

// Bancos autorizados según la entidad que emitió la multa.
// Fuente: public/entidades.json (campo dondePagar) + verificación SAT.
const BANCOS_POR_ENTIDAD = {
  pnc: ['pagoBancosSistema'],
  emetra: ['pagoBanrural'],
  emixtra: ['pagoBancoIndustrial'],
  santa_catarina_pinula: ['pagoBancoIndustrial'],
}

const PASOS = ['pagoPaso1', 'pagoPaso2', 'pagoPaso3', 'pagoPaso4', 'pagoPaso5']

export default function Pago() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const placa = params.get('placa') ?? ''
  const entidad = params.get('entidad') ?? ''

  const bancos = BANCOS_POR_ENTIDAD[entidad] ?? [
    'pagoBanrural',
    'pagoBancoIndustrial',
    'pagoBancosSistema',
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Button
        variant="ghost"
        className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() =>
          navigate(
            `/detalle?placa=${encodeURIComponent(placa)}&entidad=${encodeURIComponent(entidad)}`
          )
        }
      >
        ← {t('volver')}
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

      {/* Nota de descuento */}
      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900">
        <FontAwesomeIcon icon={faLightbulb} className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t('pagoNotaDescuento')}</span>
      </div>

      {/* Pasos */}
      <section className="mt-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {t('pagoPasosTitulo')}
        </h2>
        <ol className="space-y-2.5">
          {PASOS.map((clave, i) => (
            <li key={clave} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-emerald-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-gray-700">{t(clave)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Bancos autorizados */}
      <section className="mt-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {t('pagoBancosTitulo')}
        </h2>
        <div className="space-y-2.5">
          {bancos.map((clave) => (
            <div
              key={clave}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 px-3 py-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <FontAwesomeIcon icon={faBuildingColumns} className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-gray-800">{t(clave)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Canales */}
      <section className="mt-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-2xl border-l-4 border-emerald-400 bg-emerald-50/60 p-3">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-800">
              <FontAwesomeIcon icon={faCreditCard} className="h-3.5 w-3.5" />
              {t('pagoEnLinea')}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-900/80">
              {t('pagoEnLineaDesc')}
            </p>
          </div>
          <div className="rounded-2xl border-l-4 border-sky-400 bg-sky-50/60 p-3">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-800">
              <FontAwesomeIcon icon={faHandHoldingDollar} className="h-3.5 w-3.5" />
              {t('pagoPresencial')}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-sky-900/80">
              {t('pagoPresencialDesc')}
            </p>
          </div>
        </div>
        <div className="mt-2.5 rounded-2xl border-l-4 border-amber-400 bg-amber-50/60 p-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-800">
            <FontAwesomeIcon icon={faLandmark} className="h-3.5 w-3.5" />
            {t('pagoPortalSAT')}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
            {t('pagoPortalSATDesc')}
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-muted-foreground">
        <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t('pagoNoOficial')}</span>
      </div>
    </div>
  )
}