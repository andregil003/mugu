// P3: Semáforo de legalidad — verde/amarillo/rojo según core.js.
import { useSearchParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { calcularSemaforo } from '@/lib/core'

const COLORES = {
  verde: { texto: 'text-green-700', bg: 'bg-green-100', icono: 'text-green-600' },
  amarillo: { texto: 'text-amber-700', bg: 'bg-amber-100', icono: 'text-amber-500' },
  rojo: { texto: 'text-red-700', bg: 'bg-red-100', icono: 'text-red-600' },
}

export default function Semaforo() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const fecha = params.get('fecha') ?? ''
  const semaforo = calcularSemaforo(fecha)
  const estilo = COLORES[semaforo.color] ?? COLORES.verde

  const mensaje =
    semaforo.color === 'verde'
      ? t('semaforoVerde')
      : semaforo.color === 'amarillo'
        ? t('semaforoAmarillo')
        : t('semaforoRojo')

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Semáforo de legalidad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`rounded-xl p-8 text-center ${estilo.bg}`}>
            <FontAwesomeIcon icon={faCircle} size="3x" className={estilo.icono} />
            <p className={`mt-3 text-lg font-bold ${estilo.texto}`}>{mensaje}</p>
            <p className={`mt-1 text-sm ${estilo.texto}`}>{semaforo.motivo}</p>
          </div>
          <Button className="w-full" onClick={() => navigate('/que-hago')}>
            {t('queHagoTitulo')} →
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}