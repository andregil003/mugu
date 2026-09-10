// P3.5: ¿Qué hago? — 3 opciones: pagar / oposición / prescripción.
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCreditCard, faScaleBalanced, faScroll } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'

export default function QueHago() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{t('queHagoTitulo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start py-6"
            onClick={() => navigate('/accion?tipo=pagar')}
          >
            <FontAwesomeIcon icon={faCreditCard} className="mr-2" />
            {t('queHagoPagar')}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start py-6"
            onClick={() => navigate('/accion?tipo=oposicion')}
          >
            <FontAwesomeIcon icon={faScaleBalanced} className="mr-2" />
            {t('queHagoOposicion')} (15 días)
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start py-6"
            onClick={() => navigate('/accion?tipo=prescripcion')}
          >
            <FontAwesomeIcon icon={faScroll} className="mr-2" />
            {t('queHagoPrescripcion')} (120 días)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}