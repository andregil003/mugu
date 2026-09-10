// pantalla_info_apelacion: guía para apelar en el juzgado de tránsito.
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'

export default function Apelacion() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const placa = params.get('placa') ?? ''
  const entidad = params.get('entidad') ?? ''

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('apelacionTitulo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('apelacionTexto')}</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              navigate(
                `/detalle?placa=${encodeURIComponent(placa)}&entidad=${encodeURIComponent(entidad)}`
              )
            }
          >
            ← {t('volver')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}