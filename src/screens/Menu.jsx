// pantalla_menu_principal: Núcleo de enrutamiento — 3 flujos según necesidad.
// Cards grandes con icono + descripción; grid en desktop, apiladas en móvil.
// Cada card remata con una acción clara ("Comenzar") en vez de una flecha suelta.
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faFileLines,
  faCircleQuestion,
  faPlay,
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
    acento: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  {
    ruta: '/info',
    icono: faCircleQuestion,
    titulo: 'menuNoEntiendo',
    desc: 'menuInfoDesc',
    acento: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  },
]

export default function Menu() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:py-12">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          {t('appNombre')}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight lg:text-4xl">
          {t('menuTitulo')}
        </h1>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {OPCIONES.map((op) => (
          <button
            key={op.ruta}
            type="button"
            onClick={() => navigate(op.ruta)}
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 active:scale-[0.98] lg:p-8"
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-transform duration-200 group-hover:scale-110 ${op.acento}`}
            >
              <FontAwesomeIcon icon={op.icono} />
            </span>
            <span className="mt-4 text-lg font-bold leading-snug">{t(op.titulo)}</span>
            <span className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t(op.desc)}
            </span>
            <span className="mt-5 flex w-full items-center justify-between rounded-xl bg-muted/60 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
              {t('menuComenzar')}
              <FontAwesomeIcon
                icon={faPlay}
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}