// pantalla_idioma: Selección de idioma (es / k'iche' / kaqchikel) — portada MUGU.
// Look consistente con el resto de la app: navbar con logo (AppShell), fondo
// degradado violeta→fucsia→rosa, cards redondeadas y botones animados.
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faLanguage } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '@/lib/i18n'

export default function Idioma() {
  const { t, idiomas, setIdioma } = useI18n()
  const navigate = useNavigate()

  function elegir(codigo) {
    setIdioma(codigo) // el provider persiste en localStorage
    navigate('/bienvenida')
  }

  return (
    <div className="relative mx-auto w-full max-w-md px-4 py-10">
      {/* Fondo decorativo degradado */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 blur-3xl" />
      </div>

      {/* Hero de la portada */}
      <div className="hero-gradient overflow-hidden rounded-3xl shadow-xl">
        <div className="relative px-6 py-8 text-center text-white">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
          <img
            src="/icon-192.png"
            alt={t('appNombre')}
            className="mx-auto h-20 w-20 rounded-2xl object-cover shadow-lg ring-4 ring-white/20"
          />
          <h1 className="mt-4 text-3xl font-black tracking-tight">
            {t('appNombre')}
          </h1>
          <p className="mt-1 text-sm font-medium text-white/80">
            {t('appNombreLargo')}
          </p>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/90">
            {t('heroSubtitulo')}
          </p>
        </div>
      </div>

      {/* Selección de idioma */}
      <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="mb-4 flex items-center justify-center gap-2 text-center text-sm font-semibold text-muted-foreground">
          <FontAwesomeIcon icon={faLanguage} className="h-4 w-4 text-violet-600" />
          {t('seleccionaIdioma')}
        </p>
        <div className="space-y-3">
          {idiomas.map((i) => (
            <button
              key={i.codigo}
              type="button"
              onClick={() => elegir(i.codigo)}
              className="group flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/10 active:scale-[0.98]"
            >
              <span className="text-lg font-bold">{i.nombre}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700 transition-all duration-200 group-hover:bg-violet-600 group-hover:text-white group-hover:translate-x-0.5">
                <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => alert('TODO: formulario de sugerencia de idioma')}
          className="mt-4 w-full rounded-xl py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-[0.98]"
        >
          {t('sugerirIdioma')}
        </button>
      </div>
    </div>
  )
}