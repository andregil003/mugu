// pantalla_tabla_informativa (Flujo C): tipos de multas a lenguaje casual.
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { cargarInfracciones } from '@/lib/data'

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
                  {i.descripcion ?? ''}
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