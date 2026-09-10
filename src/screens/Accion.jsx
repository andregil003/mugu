// P4: Acción — PDF de impugnación / pago con descuento.
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

export default function Accion() {
  const { t } = useI18n()
  const [params] = useSearchParams()
  const tipo = params.get('tipo') ?? 'pagar'
  const [acepta, setAcepta] = useState(false)

  // TODO(Lemus): generar PDF real con jsPDF + plantilla-impugnacion.md
  function generarPdf() {
    alert('TODO: generar PDF con jsPDF (Lemus)')
  }

  const titulo =
    tipo === 'oposicion'
      ? 'Impugnación por oposición'
      : tipo === 'prescripcion'
        ? 'Solicitud de prescripción'
        : 'Pago con descuento'

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{titulo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {tipo === 'pagar'
              ? 'Pagá dentro de los 60 días para aplicar el descuento por curso vial.'
              : 'Se genera un borrador listo para presentar. No es asesoría legal.'}
          </p>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={acepta} onCheckedChange={setAcepta} />
            <span>{t('disclaimer')}</span>
          </label>
          <Button className="w-full" disabled={!acepta} onClick={generarPdf}>
            {t('botonGenerarPdf')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}