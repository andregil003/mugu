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
    navigate('/bienvenida')
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
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="space-y-3">
        {idiomas.map((i) => (
          <button
            key={i.codigo}
            type="button"
            onClick={() => elegir(i.codigo)}
            className="group flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98]"
          >
            <span className="flex flex-col gap-1">
              <span className="text-lg font-bold">{i.nombre}</span>
              <span className="animar-izq-der bg-gradient-to-r from-green-700 via-emerald-600 to-emerald-500 bg-clip-text text-sm font-medium text-transparent">
                {i.bienvenida}
              </span>
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-all duration-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:translate-x-0.5">
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
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
            className="relative w-full max-w-sm animate-in zoom-in-95 fade-in rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl"
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
  )
}