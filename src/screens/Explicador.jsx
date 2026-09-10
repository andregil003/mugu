// P2: Explicador de multa — lenguaje claro + montos + descuentos + botones "?".
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useI18n } from '@/lib/i18n'

// TODO(Lemus): cargar desde infracciones.json
const MOCK_INFRACCION = {
  id: 'semaforo_rojo',
  nombre: 'No respetar semáforo en rojo',
  monto: 400,
  descuento_curso_vial: 300,
  consejo: 'Si la notificación no llegó en 120 días, prescribe.',
}

export default function Explicador() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fecha = params.get('fecha') ?? ''

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{MOCK_INFRACCION.nombre}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <span className="text-sm text-muted-foreground">Monto</span>
            <span className="text-2xl font-bold">Q{MOCK_INFRACCION.monto}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-green-50 p-4">
            <span className="text-sm text-green-700">Con curso vial</span>
            <span className="text-xl font-bold text-green-700">
              Q{MOCK_INFRACCION.descuento_curso_vial}
            </span>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <p className="text-sm">{MOCK_INFRACCION.consejo}</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={t('botonInfo')}>?</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      La prescripción aplica si pasaron más de 120 días desde la infracción.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <Button className="w-full" onClick={() => navigate(`/semaforo?fecha=${fecha}`)}>
            Ver semáforo de legalidad →
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}