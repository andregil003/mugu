// AppShell: layout compartido de la app — header con logo + nav responsive.
// Móvil: bottom-nav fija. Desktop: top-nav en el header. Footer con disclaimer.
// Las rutas de onboarding (/, /idioma) no muestran navegación.
import { useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShieldHalved,
  faMagnifyingGlass,
  faFileLines,
  faCircleQuestion,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const RUTAS_SIN_NAV = ['/', '/idioma']

const NAV_ITEMS = [
  { ruta: '/menu', icono: faShieldHalved, clave: 'navInicio', activas: ['/menu', '/bienvenida'] },
  { ruta: '/buscar', icono: faMagnifyingGlass, clave: 'navBuscar', activas: ['/buscar', '/resultados', '/detalle', '/apelacion', '/pago'] },
  { ruta: '/multa-fisica', icono: faFileLines, clave: 'navMulta', activas: ['/multa-fisica'] },
  { ruta: '/info', icono: faCircleQuestion, clave: 'navInfo', activas: ['/info'] },
]

function estaActiva(pathname, activas) {
  return activas.some((r) => pathname === r || pathname.startsWith(`${r}/`))
}

export default function AppShell({ children }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const sinNav = RUTAS_SIN_NAV.includes(pathname)

  return (
    <div className="flex min-h-svh flex-col">
      {!sinNav && (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate('/menu')}
              className="flex shrink-0 items-center gap-2 transition hover:opacity-80 active:scale-95"
              aria-label={t('appNombre')}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
              </span>
              <span className="text-base font-black tracking-tight">
                {t('appNombre')}
              </span>
            </button>

            {/* Nav desktop */}
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.ruta}
                  type="button"
                  onClick={() => navigate(item.ruta)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition active:scale-95',
                    estaActiva(pathname, item.activas)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <FontAwesomeIcon icon={item.icono} className="h-4 w-4" />
                  {t(item.clave)}
                </button>
              ))}
            </nav>

            {/* Idioma */}
            <button
              type="button"
              onClick={() => navigate('/idioma')}
              className="flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95"
            >
              <FontAwesomeIcon icon={faGlobe} className="h-4 w-4" />
              <span className="hidden sm:inline">{t('labelIdioma')}</span>
            </button>
          </div>
        </header>
      )}

      <main className={cn('flex-1', !sinNav && 'pb-24 lg:pb-10')}>{children}</main>

      {!sinNav && (
        <>
          {/* Footer desktop */}
          <footer className="hidden border-t border-border/60 py-6 lg:block">
            <div className="mx-auto w-full max-w-5xl px-4 text-center text-xs leading-relaxed text-muted-foreground">
              <p>{t('disclaimer')}</p>
              <p className="mt-1">{t('footer')}</p>
            </div>
          </footer>

          {/* Bottom-nav móvil */}
          <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
            aria-label="Navegación principal"
          >
            <div className="mx-auto grid h-16 max-w-md grid-cols-4">
              {NAV_ITEMS.map((item) => {
                const activo = estaActiva(pathname, item.activas)
                return (
                  <button
                    key={item.ruta}
                    type="button"
                    onClick={() => navigate(item.ruta)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition active:scale-95',
                      activo
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-8 w-12 items-center justify-center rounded-full transition',
                        activo && 'bg-primary/10'
                      )}
                    >
                      <FontAwesomeIcon icon={item.icono} className="h-4 w-4" />
                    </span>
                    {t(item.clave)}
                  </button>
                )
              })}
            </div>
          </nav>
        </>
      )}
    </div>
  )
}