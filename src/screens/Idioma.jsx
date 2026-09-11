// pantalla_idioma: Selección de idioma (es / en / k'iche' / kaqchikel).
// BIG2-M0: sin tarjeta MUGU previa (aún no se sabe qué idioma habla la persona),
// sin título "Selecciona tu idioma", y con texto de bienvenida por idioma
// (animación izquierda → derecha + degradado).
// BIG2-M9: botón "Sugerir idioma" abre un popup modal (blur overlay) con
// formulario de sugerencia (prototipo: confirmación local, sin backend).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

export default function Idioma() {
  const { t, idiomas, setIdioma } = useI18n()
  const navigate = useNavigate()
  const [popupAbierto, setPopupAbierto] = useState(false)
  const [sugerencia, setSugerencia] = useState('')
  const [enviada, setEnviada] = useState(false)

  function elegir(codigo) {
    setIdioma(codigo) // el provider persiste en localStorage
    navigate('/tamano') // flujo: idioma → tamaño de texto → menú principal
  }

  function abrirPopup() {
    setSugerencia('')
    setEnviada(false)
    setPopupAbierto(true)
  }

  function enviar(e) {
    e.preventDefault()
    if (!sugerencia.trim()) return
    setEnviada(true)
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
      {/* Logo + MUGU centrados y destacados */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <img
          src="/icon-192.png"
          alt={t('appNombre')}
          className="h-20 w-20 rounded-2xl object-cover shadow-md"
        />
        <span className="text-3xl font-black tracking-tight">{t('appNombre')}</span>
        <span className="text-sm font-medium text-muted-foreground">
          {t('tagline')}
        </span>
      </div>
      {/* Idiomas en grid 2 columnas */}
      <div className="grid grid-cols-2 gap-3">
        {idiomas.map((i) => (
          <button
            key={i.codigo}
            type="button"
            onClick={() => elegir(i.codigo)}
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-600 to-green-700 px-3 py-5 text-center text-white shadow-md shadow-emerald-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
          >
            <span className="text-base font-bold leading-tight">{i.nombre}</span>
            <span className="text-[11px] font-medium leading-tight text-emerald-50/90">
              {i.bienvenida}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition-all duration-200 group-hover:bg-white group-hover:text-emerald-700 group-hover:translate-x-0.5">
              <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={abrirPopup}
        className="mt-4 w-full rounded-xl py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-[0.98]"
      >
        {t('sugerirIdioma')}
      </button>

      {/* Popup sugerir idioma (M9) */}
      {popupAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setPopupAbierto(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('sugerirIdioma')}
            className="relative w-full max-w-sm animate-in zoom-in-95 fade-in rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-border dark:bg-card"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold">{t('sugerirIdioma')}</h2>
              <button
                type="button"
                onClick={() => setPopupAbierto(false)}
                aria-label={t('sugerirIdiomaCerrar')}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-90"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            {enviada ? (
              <div className="mt-4 animate-in fade-in slide-in-from-bottom-1 rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-800">
                  {t('sugerirIdiomaGracias')}
                </p>
                <Button
                  type="button"
                  className="mt-3 w-full rounded-xl"
                  onClick={() => setPopupAbierto(false)}
                >
                  {t('sugerirIdiomaCerrar')}
                </Button>
              </div>
            ) : (
              <form onSubmit={enviar} className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('sugerirIdiomaDesc')}
                </p>
                <input
                  value={sugerencia}
                  onChange={(e) => setSugerencia(e.target.value)}
                  placeholder={t('sugerirIdiomaPlaceholder')}
                  aria-label={t('sugerirIdiomaPlaceholder')}
                  autoFocus
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm transition hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
                />
                <Button
                  type="submit"
                  disabled={!sugerencia.trim()}
                  className="w-full rounded-xl"
                >
                  {t('sugerirIdiomaEnviar')}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}