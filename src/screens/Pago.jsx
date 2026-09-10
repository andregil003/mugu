// pantalla_info_pagar: pasarelas de pago o instrucciones bancarias.
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'

export default function Pago() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('pagoTitulo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('pagoTexto')}</p>
          <Button variant="outline" className="w-full" onClick={() => navigate('/detalle')}>
            ← Volver
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}