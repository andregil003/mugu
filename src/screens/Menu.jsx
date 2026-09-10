// pantalla_menu_principal: Núcleo de enrutamiento — 3 flujos según necesidad.
// Cards grandes con icono + descripción; grid en desktop, apiladas en móvil.
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faFileLines,
  faCircleQuestion,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '@/lib/i18n'

const OPCIONES = [
  {
    ruta: '/buscar',
    icono: faMagnifyingGlass,
    titulo: 'menuBuscarMultas',
    desc: 'menuBuscarDesc',
    acento: 'bg-primary/10 text-primary',
  },
  {
    ruta: '/multa-fisica',
    icono: faFileLines,
    titulo: 'menuMultaFisica',
    desc: 'menuMultaDesc',
    acento: 'bg-emerald-100 text-emerald-700',
  },
  {
    ruta: '/info',
    icono: faCircleQuestion,
    titulo: 'menuNoEntiendo',
    desc: 'menuInfoDesc',
    acento: 'bg-amber-100 text-amber-700',
  },
]

export default function Menu() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 lg:py-12">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          {t('appNombre')}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight lg:text-4xl">
          {t('menuTitulo')}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {OPCIONES.map((op) => (
          <button
            key={op.ruta}
            type="button"
            onClick={() => navigate(op.ruta)}
            className="card-interactive group flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-6 text-left shadow-sm"
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-transform duration-200 group-hover:scale-110 ${op.acento}`}
            >
              <FontAwesomeIcon icon={op.icono} />
            </span>
            <span className="flex w-full items-center justify-between gap-2">
              <span className="text-lg font-bold leading-snug">{t(op.titulo)}</span>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary"
              />
            </span>
            <span className="text-sm leading-relaxed text-muted-foreground">
              {t(op.desc)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}