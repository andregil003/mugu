// pantalla_ingreso_placa (Flujo A): búsqueda general solo con placa.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n'
import { validarPlaca } from '@/lib/core'

export default function Buscar() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [placa, setPlaca] = useState('')
  const [error, setError] = useState('')

  function buscar(e) {
    e.preventDefault()
    const p = placa.trim().toUpperCase()
    if (!validarPlaca(p)) {
      setError('Formato inválido: 3 letras + 3-4 números')
      return
    }
    navigate(`/resultados?placa=${encodeURIComponent(p)}`)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('buscarTitulo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={buscar} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelPlaca')}</label>
              <Input
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="P123ABC"
                aria-label={t('labelPlaca')}
                autoFocus
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              {t('botonBuscar')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}