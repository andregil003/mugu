// pantalla_ingreso_placa (Flujo A): búsqueda general solo con placa.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="min-h-svh bg-gradient-to-b from-violet-50 via-white to-white">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <Button
          variant="ghost"
          className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
          onClick={() => navigate('/menu')}
        >
          ← {t('volver')}
        </Button>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 shadow-lg">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative px-6 py-7 text-white">
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">
              {t('appNombre')}
            </p>
            <h1 className="mt-1 text-3xl font-bold">{t('buscarTitulo')}</h1>
            <p className="mt-1 text-sm text-white/80">{t('heroSubtitulo')}</p>
          </div>
        </div>

        <Card className="mt-5 rounded-3xl bg-white/80 shadow-sm backdrop-blur transition-shadow hover:shadow-md">
          <CardContent className="py-6">
            <form onSubmit={buscar} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
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
                    className="h-12 rounded-2xl text-center text-lg font-semibold tracking-widest transition hover:border-fuchsia-400 focus-visible:ring-fuchsia-500/30"
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
                  className="h-12 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 px-8 text-sm font-bold shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
                >
                  {t('botonBuscar')}
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Escribí la placa tal como aparece en el vehículo.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}