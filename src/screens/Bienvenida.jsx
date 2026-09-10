// pantalla_bienvenida: Landing "¿HAS SIDO MULTADO?" + botón "¿Qué procede?"
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'

export default function Bienvenida() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardContent className="space-y-6 py-12 text-center">
          <h1 className="text-4xl font-black tracking-tight">{t('hasSidoMultado')}</h1>
          <p className="text-muted-foreground">{t('tagline')}</p>
          <Button size="lg" className="w-full py-6 text-lg" onClick={() => navigate('/menu')}>
            {t('queProcede')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}