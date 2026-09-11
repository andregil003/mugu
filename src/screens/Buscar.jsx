// pantalla_ingreso_placa (Flujo A): búsqueda general con placa.
// BIG2-M3: desplegable de sigla (P123ABC, igual que multa física) + placas
// recientes en slider horizontal (límite 5, "X" en hover para quitar, la más
// vieja se elimina automáticamente al agregar una nueva).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faClockRotateLeft, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PageHero from '@/components/PageHero'
import { useI18n } from '@/lib/i18n'
import { validarPlaca, PREFIJOS_PLACA } from '@/lib/core'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const MAX_RECIENTES = 5

export default function Buscar() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [tipoPlaca, setTipoPlaca] = useState('P')
  const [restoPlaca, setRestoPlaca] = useState('')
  const [error, setError] = useState('')
  const [recientes, setRecientes] = useLocalStorage('placas', [])

  function guardarReciente(p) {
    const sinDuplicados = recientes.filter(
      (x) => x.toUpperCase() !== p.toUpperCase()
    )
    // Límite 5: la más vieja se elimina automáticamente
    setRecientes([p, ...sinDuplicados].slice(0, MAX_RECIENTES))
  }

  function quitarReciente(p) {
    setRecientes(recientes.filter((x) => x.toUpperCase() !== p.toUpperCase()))
  }

  function buscar(e) {
    e.preventDefault()
    const p = `${tipoPlaca}${restoPlaca}`.trim().toUpperCase()
    if (!validarPlaca(p)) {
      setError(t('errorPlacaInvalida'))
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
    <div className="mx-auto w-full max-w-2xl px-4 py-6 lg:py-10">
      <Button
        variant="ghost"
        className="mb-2 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() => navigate('/menu')}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
        {t('volver')}
      </Button>
      <PageHero
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
                {t('tipoPlacaLabel')}
              </label>
              <div className="flex gap-2">
                <Select value={tipoPlaca} onValueChange={setTipoPlaca}>
                  <SelectTrigger className="!h-12 w-24 shrink-0 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PREFIJOS_PLACA.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={restoPlaca}
                  onChange={(e) => setRestoPlaca(e.target.value.toUpperCase())}
                  placeholder="123ABC"
                  aria-label={t('labelPlaca')}
                  autoFocus
                  className="h-12 rounded-xl text-center text-lg font-semibold tracking-widest transition hover:border-primary/50 focus-visible:ring-primary/30"
                />
              </div>
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
          </form>

          {/* Placas recientes (caché local): slider horizontal + X en hover */}
          {recientes.length > 0 && (
            <div className="mt-5 border-t border-gray-100 pt-4 dark:border-border">
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
              <div className="flex gap-2 overflow-x-auto pb-2 pt-2">
                {recientes.map((p) => (
                  <div key={p} className="group relative shrink-0">
                    <button
                      type="button"
                      onClick={() => buscarReciente(p)}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 font-mono text-sm font-semibold tracking-wider text-emerald-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-100 hover:shadow-md active:scale-95 dark:border-emerald-950/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/50"
                    >
                      {p}
                    </button>
                    <button
                      type="button"
                      onClick={() => quitarReciente(p)}
                      aria-label={`${t('quitar')} ${p}`}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition-opacity group-hover:opacity-100 focus:opacity-100 active:scale-90"
                    >
                      <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}