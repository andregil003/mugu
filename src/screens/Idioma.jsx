// pantalla_idioma: Selección de idioma (es / en / k'iche' / kaqchikel).
// BIG2-M0: sin tarjeta MUGU previa (aún no se sabe qué idioma habla la persona),
// sin título "Selecciona tu idioma", y con texto de bienvenida por idioma
// (animación izquierda → derecha + degradado).
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '@/lib/i18n'

export default function Idioma() {
  const { t, idiomas, setIdioma } = useI18n()
  const navigate = useNavigate()

  function elegir(codigo) {
    setIdioma(codigo) // el provider persiste en localStorage
    navigate('/bienvenida')
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="space-y-3">
        {idiomas.map((i) => (
          <button
            key={i.codigo}
            type="button"
            onClick={() => elegir(i.codigo)}
            className="group flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-fuchsia-300 hover:shadow-lg hover:shadow-fuchsia-500/10 active:scale-[0.98]"
          >
            <span className="flex flex-col gap-1">
              <span className="text-lg font-bold">{i.nombre}</span>
              <span className="animar-izq-der bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-sm font-medium text-transparent">
                {i.bienvenida}
              </span>
            </span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fuchsia-100 text-fuchsia-700 transition-all duration-200 group-hover:bg-fuchsia-600 group-hover:text-white group-hover:translate-x-0.5">
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
  )
}