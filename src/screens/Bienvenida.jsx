// pantalla_bienvenida: Landing "¿HAS SIDO MULTADO?" — hero verde institucional.
// BIG2-M0: sin icono de escudo — solo el título.
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

export default function Bienvenida() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 lg:py-16">
      <div className="hero-gradient rounded-3xl p-8 text-center text-white shadow-xl lg:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-200">
          {t('appNombre')}
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight lg:text-5xl">
          {t('hasSidoMultado')}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-green-100">
          {t('tagline')}
        </p>

        <Button
          size="lg"
          className="mt-8 mx-auto w-full max-w-sm rounded-xl bg-white py-6 text-lg font-bold text-green-900 shadow-lg transition hover:bg-green-50 hover:shadow-xl active:scale-[0.98] lg:w-auto lg:px-10"
          onClick={() => navigate('/menu')}
        >
          {t('queProcede')}
          <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}