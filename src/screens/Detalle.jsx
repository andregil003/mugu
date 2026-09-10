// pantalla_detalle_multa: destino final de búsquedas — razón + stepper semáforo + acciones.
// Stepper: Notificación (verde) → Apelación (amarillo) → Pago (rojo) según plazos legales de core.js.
import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { calcularSemaforo } from '@/lib/core'
import { cargarInfracciones, sincronizarCacheDiario } from '@/lib/data'

const PASOS = [
  { id: 'noti', clave: 'stepperNoti', color: 'bg-green-500' },
  { id: 'apelacion', clave: 'stepperApelacion', color: 'bg-amber-500' },
  { id: 'pago', clave: 'stepperPago', color: 'bg-red-500' },
]

export default function Detalle() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const placa = params.get('placa') ?? ''
  const fecha = params.get('fecha') ?? ''
  const entidad = params.get('entidad') ?? ''

  const [razon, setRazon] = useState('')
  const [monto, setMonto] = useState('')

  useEffect(() => {
    let activo = true
    async function cargar() {
      const [infracciones, multas] = await Promise.all([
        cargarInfracciones().catch(() => []),
        sincronizarCacheDiario(),
      ])
      if (!activo) return

      const multa = multas.find(
        (m) =>
          m.placa === placa &&
          (!entidad || m.entidad.toLowerCase() === entidad)
      )
      const inf = infracciones.find((i) => i.id === multa?.infraccion)
      setRazon(inf?.nombre ?? multa?.infraccion ?? 'Multa de tránsito')
      setMonto(multa?.monto ? `Q${multa.monto}` : '')
    }
    cargar()
    return () => {
      activo = false
    }
  }, [placa, entidad])

  // Fase del stepper según la fecha de la multa
  const semaforo = calcularSemaforo(fecha)
  const faseActual = semaforo.color === 'verde' ? 0 : semaforo.color === 'amarillo' ? 1 : 2

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('detalleTitulo')}</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            {placa} {entidad && `· ${entidad.toUpperCase()}`}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Razón en lenguaje claro */}
          <div className="rounded-lg border p-4 text-center">
            <p className="text-lg font-semibold">{razon}</p>
            {monto && <p className="text-sm text-muted-foreground">{monto}</p>}
          </div>

          {/* Stepper semáforo */}
          <div className="flex items-center justify-between">
            {PASOS.map((paso, i) => (
              <div key={paso.id} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`h-3 w-3 rounded-full ${
                    i <= faseActual ? paso.color : 'bg-gray-200'
                  }`}
                />
                <span className={`text-xs ${i === faseActual ? 'font-bold' : 'text-muted-foreground'}`}>
                  {t(paso.clave)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">{semaforo.motivo}</p>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/apelacion')}>
              {t('botonApelar')}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/pago')}>
              {t('botonPagar')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}