// pantalla_tamano: accesibilidad — elegir tamaño de texto (Normal/Grande/Extra).
// BIG2-M1: botones con letras "Aa" de distintos tamaños, uno al lado del otro (horizontal).
// Aplica el escalado en toda la app y persiste la preferencia.
// Iron Puck: tema oscuro/claro con persistencia y respeto a prefers-color-scheme.
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faChevronLeft,
  faMoon,
  faSun,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { useTamano } from '@/lib/tamano'
import { useDarkMode } from '@/hooks/useDarkMode'

const CLAVE_TAMANO = {
  normal: 'tamanoNormal',
  grande: 'tamanoGrande',
  extra: 'tamanoExtra',
}

const TAMANO_CLASE = {
  normal: 'text-base',
  grande: 'text-xl',
  extra: 'text-2xl',
}

export default function Tamano() {
  const { t } = useI18n()
  const { tamano, setTamano, tamanos } = useTamano()
  const { isDark, toggle } = useDarkMode()
  const navigate = useNavigate()

  const TEMAS = [
    { id: 'claro', clave: 'tamanoTemaClaro', icono: faSun },
    { id: 'oscuro', clave: 'tamanoTemaOscuro', icono: faMoon },
  ]

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <div className="hero-gradient overflow-hidden rounded-3xl shadow-lg">
        <div className="px-6 py-7 text-white">
          <h1 className="text-2xl font-bold">{t('tamanoTitulo')}</h1>
          <p className="mt-1 text-sm text-white/80">{t('tamanoDesc')}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {tamanos.map((op) => {
          const activo = tamano === op.codigo
          return (
            <button
              key={op.codigo}
              type="button"
              onClick={() => setTamano(op.codigo)}
              aria-label={t(CLAVE_TAMANO[op.codigo])}
              aria-pressed={activo}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-6 transition-all duration-200 active:scale-[0.98] ${
                activo
                  ? 'border-emerald-400 bg-emerald-50 shadow-md ring-2 ring-emerald-200 dark:border-emerald-500 dark:bg-emerald-950/30 dark:ring-emerald-500/50'
                  : 'border-gray-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-border dark:bg-card dark:hover:border-emerald-500/50'
              }`}
            >
              <span className={`font-black leading-none ${TAMANO_CLASE[op.codigo]}`}>Aa</span>
              <span className="text-xs font-medium text-muted-foreground">
                {t(CLAVE_TAMANO[op.codigo])}
              </span>
              {activo && <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-emerald-600" />}
            </button>
          )
        })}
      </div>

      {/* Tema: claro/oscuro (pill toggle, como los botones Aa) */}
      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold">{t('tamanoTema')}</p>
        <div className="grid grid-cols-2 gap-3">
          {TEMAS.map((op) => {
            const activo =
              (op.id === 'oscuro' && isDark) || (op.id === 'claro' && !isDark)
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => {
                  if ((op.id === 'oscuro' && !isDark) || (op.id === 'claro' && isDark)) {
                    toggle()
                  }
                }}
                aria-label={t(op.clave)}
                aria-pressed={activo}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-5 transition-all duration-200 active:scale-[0.98] ${
                  activo
                    ? 'border-emerald-400 bg-emerald-50 shadow-md ring-2 ring-emerald-200 dark:border-emerald-500 dark:bg-emerald-950/30 dark:ring-emerald-500/50'
                    : 'border-gray-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-border dark:bg-card dark:hover:border-emerald-500/50'
                }`}
              >
                <FontAwesomeIcon
                  icon={op.icono}
                  className={`h-6 w-6 ${
                    op.id === 'oscuro' ? 'text-indigo-500' : 'text-amber-500'
                  }`}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {t(op.clave)}
                </span>
                {activo && <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-emerald-600" />}
              </button>
            )
          })}
        </div>
      </div>

      <Button
        className="mt-6 w-full rounded-xl py-5"
        onClick={() => navigate('/menu')}
      >
        {t('tamanoContinuar')}
      </Button>

      <Button
        variant="outline"
        className="mt-3 w-full rounded-xl py-5"
        onClick={() => navigate(-1)}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
        {t('volver')}
      </Button>
    </div>
  )
}