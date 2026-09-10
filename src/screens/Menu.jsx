// pantalla_menu_principal: Núcleo de enrutamiento — 3 flujos según necesidad.
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faFileLines, faCircleQuestion } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'

export default function Menu() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('menuTitulo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full py-6 text-lg" onClick={() => navigate('/buscar')}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
            {t('menuBuscarMultas')}
          </Button>
          <Button className="w-full py-6 text-lg" variant="secondary" onClick={() => navigate('/multa-fisica')}>
            <FontAwesomeIcon icon={faFileLines} className="mr-2" />
            {t('menuMultaFisica')}
          </Button>
          <Button className="w-full py-6 text-lg" variant="outline" onClick={() => navigate('/info')}>
            <FontAwesomeIcon icon={faCircleQuestion} className="mr-2" />
            {t('menuNoEntiendo')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}