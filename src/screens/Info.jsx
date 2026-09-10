// pantalla_tabla_informativa (Flujo C): tipos de multas a lenguaje casual.
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { cargarInfracciones } from '@/lib/data'

const EXPLICACION_CASUAL = {
  semaforo_rojo: 'Pasaste el semáforo en rojo. Es de las multas más comunes.',
  estacionamiento_prohibido: 'Estacionaste donde no se puede.',
  licencia_vencida: 'Tu licencia estaba vencida al momento del control.',
  sin_tarjeta_circulacion: 'No llevabas la tarjeta de circulación vigente.',
  exceso_velocidad: 'Ibas a más velocidad de la permitida en esa vía.',
  basura_vehiculo: 'Tiraste basura desde el vehículo.',
}

export default function Info() {
  const { t } = useI18n()
  const [infracciones, setInfracciones] = useState([])

  useEffect(() => {
    cargarInfracciones().then(setInfracciones).catch(() => {})
  }, [])

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('infoTitulo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {infracciones.map((i) => (
              <div key={i.id} className="rounded-lg border p-3">
                <p className="font-semibold">{i.nombre ?? i.id}</p>
                <p className="text-sm text-muted-foreground">
                  {EXPLICACION_CASUAL[i.id] ?? i.descripcion ?? ''}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Monto: Q{i.monto ?? i.multa ?? ''}
                </p>
              </div>
            ))}
            {infracciones.length === 0 && (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}