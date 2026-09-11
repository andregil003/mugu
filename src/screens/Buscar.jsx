// pantalla_ingreso_placa (Flujo A): búsqueda general solo con placa.
// Guarda placas recientes en localStorage (caché local, sin cuentas) y
// permite re-buscar con un toque o limpiar el historial.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClockRotateLeft, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import PageHero from '@/components/PageHero'
import { useI18n } from '@/lib/i18n'
import { validarPlaca } from '@/lib/core'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const MAX_RECIENTES = 5

export default function Buscar() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [placa, setPlaca] = useState('')
  const [error, setError] = useState('')
  const [recientes, setRecientes] = useLocalStorage('placas', [])

  function guardarReciente(p) {
    const sinDuplicados = recientes.filter(
      (x) => x.toUpperCase() !== p.toUpperCase()
    )
    setRecientes([p, ...sinDuplicados].slice(0, MAX_RECIENTES))
  }

  function buscar(e) {
    e.preventDefault()
    const p = placa.trim().toUpperCase()
    if (!validarPlaca(p)) {
      setError('Formato inválido: verifica tu placa (ej. P123ABC o M123ABC)')
      return
    }
    guardarReciente(p)
    navigate(`/resultados?placa=${encodeURIComponent(p)}`)
  }

  function buscarReciente(p) {
    guardarReciente(p)
    navigate(`/resultados?placa=${encodeURIComponent(p)}`)
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 lg:py-10">
      <PageHero
        eyebrow={t('appNombre')}
        titulo={t('buscarTitulo')}
        subtitulo={t('heroSubtitulo')}
      />

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
                className="h-12 rounded-xl text-center text-lg font-semibold tracking-widest transition hover:border-primary/50 focus-visible:ring-primary/30"
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
              className="w-full rounded-xl bg-primary py-6 text-sm font-bold shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
            >
              {t('botonBuscar')}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {t('labelIdioma')}: escribí la placa tal como aparece en el
              vehículo.
            </p>
          </form>

          {/* Placas recientes (caché local) */}
          {recientes.length > 0 && (
            <div className="mt-5 border-t border-gray-100 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <FontAwesomeIcon icon={faClockRotateLeft} className="h-3.5 w-3.5" />
                  {t('placasRecientes')}
                </p>
                <button
                  type="button"
                  onClick={() => setRecientes([])}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-red-50 hover:text-red-600 active:scale-95"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                  {t('limpiar')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recientes.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => buscarReciente(p)}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 font-mono text-sm font-semibold tracking-wider text-emerald-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-100 hover:shadow-md active:scale-95"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}