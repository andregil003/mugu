// pantalla_resultados_muni (Flujo A): grilla de entidades al estilo portal SAT.
// Cada botón muestra la imagen de la entidad + badge (notificación estilo iPhone).
// Con multas → rojo activo y navegable. Sin multas → gris y no seleccionable.
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import PageHero from '@/components/PageHero'
import { useI18n } from '@/lib/i18n'
import { sincronizarCacheDiario, forzarActualizacion } from '@/lib/data'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { inferirTipoVehiculo, TIPO_LABEL, normalizarEntidad } from '@/lib/core'

export default function Municipios() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [placas] = useLocalStorage('placas', [])

  // Placa viene del query param (?placa=) o de la última guardada
  const placa = params.get('placa') ?? placas[placas.length - 1] ?? ''

  const [entidades, setEntidades] = useState([])
  const [conteo, setConteo] = useState({})
  const [tipoVehiculo, setTipoVehiculo] = useState('')
  const [actualizando, setActualizando] = useState(false)

  useEffect(() => {
    let activo = true
    async function cargar() {
      if (!placa) return
      setTipoVehiculo(inferirTipoVehiculo(placa))

      const [lista, multas] = await Promise.all([
        fetch('/entidades.json')
          .then((r) => r.json())
          .then((d) => d.entidades ?? [])
          .catch(() => []),
        sincronizarCacheDiario(),
      ])
      if (!activo) return

      // Contar multas pendientes por entidad (campo 'entidad' del backend)
      const conteos = {}
      if (multas.length > 0) {
        const p = placa.trim().toUpperCase()
        multas
          .filter((m) => m.placa?.trim().toUpperCase() === p && m.estado !== 'pagada')
          .forEach((m) => {
            const id = normalizarEntidad(m.entidad)
            conteos[id] = (conteos[id] ?? 0) + 1
          })
      }

      setConteo(conteos)
      setEntidades(lista)
    }
    cargar()
    return () => {
      activo = false
    }
  }, [placa])

  async function actualizar() {
    setActualizando(true)
    await forzarActualizacion()
    setActualizando(false)
    window.location.reload()
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:py-10">
      <Button
        variant="ghost"
        className="mb-2 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() => navigate('/buscar')}
      >
        ← {t('volver')}
      </Button>
      <PageHero
        eyebrow={placa}
        titulo={t('municipiosTitulo')}
        subtitulo={
          tipoVehiculo ? t(TIPO_LABEL[tipoVehiculo] ?? 'tipoOtro') : undefined
        }
      />

      <Card className="mt-4 rounded-2xl shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="space-y-4 py-5">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {entidades.map((e) => {
              const n = conteo[e.id] ?? 0
              const activo = n > 0
              return (
                <button
                  key={e.id}
                  type="button"
                  disabled={!activo}
                  onClick={() =>
                    navigate(
                      `/multas?placa=${encodeURIComponent(placa)}&entidad=${e.id}`
                    )
                  }
                  title={`${e.corto}${activo ? ` — ${n} ${t('municipiosConMultas')}` : ` — ${t('municipiosSinMultas')}`}`}
                  className={`group flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all duration-200 ${
                    activo
                      ? 'cursor-pointer border-border bg-card shadow-sm hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 active:scale-95'
                      : 'cursor-not-allowed border-border bg-muted/40'
                  }`}
                >
                  <span className="relative block h-16 w-full">
                    <img
                      src={e.imagen}
                      alt={`${e.corto} — ${e.jurisdiccion}`}
                      loading="lazy"
                      className={`mx-auto h-16 w-16 rounded-lg border border-border object-contain p-0.5 transition-all duration-200 ${
                        activo
                          ? 'group-hover:scale-105 group-hover:shadow-md'
                          : 'grayscale opacity-50'
                      }`}
                    />
                    {activo ? (
                      <span className="absolute -right-2 -top-2 flex h-6 min-w-6 animate-in zoom-in-95 fade-in items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 px-1.5 text-xs font-bold text-white shadow-md ring-2 ring-white transition-transform group-hover:scale-110">
                        {n}
                      </span>
                    ) : (
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] leading-none text-muted-foreground ring-2 ring-white">
                        —
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-[11px] font-medium leading-tight transition-colors ${
                      activo
                        ? 'text-foreground group-hover:text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {e.corto}
                  </span>
                </button>
              )
            })}
          </div>

          <Button
            variant="ghost"
            className="w-full transition hover:bg-primary/10 hover:text-primary active:scale-[0.98]"
            onClick={actualizar}
            disabled={actualizando}
          >
            {actualizando ? t('actualizando') : <><FontAwesomeIcon icon={faRotate} className="mr-2" />{t('actualizarDatos')}</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}