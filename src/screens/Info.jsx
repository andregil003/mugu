// pantalla_tabla_informativa (Flujo C): tipos de multas a lenguaje casual.
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
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
                {i.consejo && (
                  <p className="mt-2 flex items-start gap-2 rounded-lg bg-emerald-100/70 px-3 py-2 text-xs leading-relaxed text-emerald-900">
                    <FontAwesomeIcon icon={faLightbulb} className="mt-0.5 shrink-0" />
                    <span>{i.consejo}</span>
                  </p>
                )}
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