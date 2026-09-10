// P0.5: Selección de placa (múltiples placas en localStorage).
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function Placas() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const placaNueva = (params.get('placa') ?? '').trim()
  const [placas, setPlacas] = useLocalStorage('placas', [])

  function guardarYContinuar(placa) {
    if (placa && !placas.includes(placa)) {
      setPlacas([...placas, placa])
    }
    navigate('/municipios')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{t('municipiosTitulo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {placas.length === 0 && !placaNueva && (
            <p className="text-center text-muted-foreground">No tenés placas guardadas.</p>
          )}
          {placas.map((p) => (
            <Button
              key={p}
              variant="outline"
              className="w-full justify-between"
              onClick={() => guardarYContinuar(p)}
            >
              <span>{p}</span>
              <span className="text-muted-foreground">→</span>
            </Button>
          ))}
          {placaNueva && (
            <Button className="w-full" onClick={() => guardarYContinuar(placaNueva)}>
              {placaNueva} ({t('botonAgregarPlaca')})
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}