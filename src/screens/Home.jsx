// P0: Landing "¿Te llegó una multa?" + entrada QR/URL + placa + idioma.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { IdiomaSelector } from '@/components/IdiomaSelector'
import { useI18n } from '@/lib/i18n'
import { validarPlaca } from '@/lib/core'

export default function Home() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [placa, setPlaca] = useState('')
  const [tamano, setTamano] = useState('normal')
  const [error, setError] = useState('')

  function continuar(e) {
    e.preventDefault()
    if (!validarPlaca(placa)) {
      setError('Formato inválido: 3 letras + 3-4 números')
      return
    }
    navigate(`/placas?placa=${encodeURIComponent(placa.trim().toUpperCase())}`)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8" style={{ fontSize: tamano === 'grande' ? '115%' : tamano === 'muy-grande' ? '130%' : '100%' }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('heroTitulo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={continuar} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelPlaca')}</label>
              <Input
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="P123ABC"
                aria-label={t('labelPlaca')}
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
            <Button type="submit" className="w-full">
              {t('botonExplicarMulta')}
            </Button>
          </form>
          <div className="mt-6">
            <IdiomaSelector tamano={tamano} setTamano={setTamano} />
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{t('disclaimer')}</p>
        </CardContent>
      </Card>
    </div>
  )
}