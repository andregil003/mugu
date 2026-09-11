// AppShell: layout compartido de la app — header con logo + nav responsive.
// Móvil: bottom-nav fija. Desktop: top-nav en el header. Footer con disclaimer.
// Rutas de onboarding: / (sin nada), /idioma (solo header con logo MUGU).
import { useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse,
  faMagnifyingGlass,
  faFileLines,
  faCircleQuestion,
  faGlobe,
  faTextHeight,
} from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { GradientDots } from '@/components/ui/gradient-dots'

const RUTAS_SIN_NAV = ['/', '/idioma']
const RUTAS_SOLO_LOGO = ['/idioma']

const NAV_ITEMS = [
  { ruta: '/menu', icono: faHouse, clave: 'navInicio', activas: ['/menu', '/bienvenida'] },
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
  const soloLogo = RUTAS_SOLO_LOGO.includes(pathname)
  const conHeader = !sinNav

  return (
    <div className="relative isolate flex min-h-svh flex-col">
      {/* Fondo global: puntos con gradiente verde animado (detrás de todo el contenido) */}
      <GradientDots />
      {conHeader && (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
          <div className="relative mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
            {/* Logo — izquierda */}
            <button
              type="button"
              onClick={() => navigate(soloLogo ? '/idioma' : '/menu')}
              className="flex shrink-0 items-center gap-2 transition hover:opacity-80 active:scale-95"
              aria-label={t('appNombre')}
            >
              <img
                src="/icon-192.png"
                alt={t('appNombre')}
                className="h-8 w-8 rounded-lg object-cover shadow-sm"
              />
              <span className="flex flex-col items-start leading-none">
                <span className="text-base font-black tracking-tight">
                  {t('appNombre')}
                </span>
                <span className="hidden text-[10px] font-medium text-muted-foreground sm:inline">
                  {t('tagline')}
                </span>
              </span>
            </button>

            {/* Nav desktop — centrado con absolute (solo desktop) */}
            {!soloLogo && (
              <nav
                className="absolute left-1/2 hidden -translate-x-1/2 items-center justify-center gap-1 lg:flex"
                aria-label={t('navAria')}
              >
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
            )}

            {/* Botones — derecha */}
            <div className="flex items-center gap-1">
              {/* Tamaño de texto (accesibilidad) */}
              <button
                type="button"
                onClick={() => navigate('/tamano')}
                className="flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-95"
                aria-label={t('tamanoTitulo')}
                title={t('tamanoTitulo')}
              >
                <FontAwesomeIcon icon={faTextHeight} className="h-4 w-4" />
                <span className="hidden sm:inline">{t('tamanoTitulo')}</span>
              </button>

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
          </div>
        </header>
      )}

      <main className={cn('flex flex-1 flex-col', conHeader && !soloLogo && 'pb-28 lg:pb-10')}>{children}</main>

      {conHeader && !soloLogo && (
        <>
          {/* Footer: visible en desktop y móvil (compacto arriba del bottom-nav) */}
          <footer className="mb-16 border-t border-border/60 py-4 lg:mb-0 lg:py-6">
            <div className="mx-auto w-full max-w-5xl px-4 text-center text-[10px] leading-relaxed text-muted-foreground lg:text-xs">
              <p>{t('disclaimer')}</p>
              <p className="mt-1">{t('footer')}</p>
            </div>
          </footer>

          {/* Bottom-nav móvil — solo iconos grandes, sin texto */}
          <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
            aria-label={t('navAria')}
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
                      'flex flex-col items-center justify-center transition active:scale-95',
                      activo
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-14 items-center justify-center rounded-full transition',
                        activo && 'bg-primary/10'
                      )}
                    >
                      <FontAwesomeIcon icon={item.icono} className="h-7 w-7" />
                    </span>
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