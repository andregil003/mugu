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
      setError('Formato inválido: verifica tu placa (ej. P123ABC o M123ABC)')
      return
    }
    navigate(`/resultados?placa=${encodeURIComponent(p)}`)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <Button
        variant="ghost"
        className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() => navigate('/menu')}
      >
        ← {t('volver')}
      </Button>

      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 shadow-lg">
        <div className="px-5 py-5 text-white">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-100">
            {t('appNombre')}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{t('buscarTitulo')}</h1>
          <p className="mt-1 text-sm text-blue-100">
            {t('heroSubtitulo')}
          </p>
        </div>
      </div>

      <Card className="mt-4 rounded-2xl shadow-sm transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            {t('labelPlaca')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={buscar} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t('labelPlaca')}
              </label>
              <Input
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="P123ABC"
                aria-label={t('labelPlaca')}
                autoFocus
                className="h-11 rounded-xl text-center text-lg font-semibold tracking-widest transition hover:border-blue-400 focus-visible:ring-blue-500/30"
              />
              {error && (
                <p className="mt-1.5 text-sm text-red-600 animate-in slide-in-from-top-1">
                  {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
            >
              {t('botonBuscar')}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {t('labelIdioma')}: escribí la placa tal como aparece en el
              vehículo.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}