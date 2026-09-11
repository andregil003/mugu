// pantalla_resultados_muni (Flujo A): grilla de entidades al estilo portal SAT.
// BIG2-M3: loading animado mientras carga (sin botón "Actualizar datos");
// si la municipalidad tiene UNA sola multa → va directo al detalle;
// si tiene varias → abre la lista de multas.
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHero from '@/components/PageHero'
import { useI18n } from '@/lib/i18n'
import { sincronizarCacheDiario } from '@/lib/data'
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
  const [multasPlaca, setMultasPlaca] = useState([])
  const [tipoVehiculo, setTipoVehiculo] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    async function cargar() {
      if (!placa) return
      setCargando(true)
      setTipoVehiculo(inferirTipoVehiculo(placa))

      const [lista, multas] = await Promise.all([
        fetch('/entidades.json')
          .then((r) => r.json())
          .then((d) => d.entidades ?? [])
          .catch(() => []),
        sincronizarCacheDiario(),
      ])
      if (!activo) return

      // Multas pendientes de esta placa (campo 'entidad' del backend)
      const p = placa.trim().toUpperCase()
      const dePlaca = multas.filter(
        (m) => m.placa?.trim().toUpperCase() === p && m.estado !== 'pagada'
      )
      const conteos = {}
      dePlaca.forEach((m) => {
        const id = normalizarEntidad(m.entidad)
        conteos[id] = (conteos[id] ?? 0) + 1
      })

      setConteo(conteos)
      setMultasPlaca(dePlaca)
      setEntidades(lista)
      setCargando(false)
    }
    cargar()
    return () => {
      activo = false
    }
  }, [placa])

  function abrirEntidad(e) {
    const n = conteo[e.id] ?? 0
    if (n === 0) return
    if (n === 1) {
      // Una sola multa → directo al detalle
      const unica = multasPlaca.find(
        (m) => normalizarEntidad(m.entidad) === e.id
      )
      const noMulta =
        unica?.no_multa ?? unica?.noMulta ?? unica?.numero ?? unica?.remision ?? ''
      navigate(
        `/detalle?placa=${encodeURIComponent(placa)}&entidad=${e.id}&noMulta=${encodeURIComponent(noMulta)}`
      )
      return
    }
    navigate(`/multas?placa=${encodeURIComponent(placa)}&entidad=${e.id}`)
  }

  if (cargando) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 lg:py-10">
      <Button
        variant="ghost"
        className="mb-2 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() => navigate('/buscar')}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5" />{' '}
        {t('volver')}
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
                  onClick={() => abrirEntidad(e)}
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
                      <span className="absolute -right-2 -top-2 flex h-6 min-w-6 animate-in zoom-in-95 fade-in items-center justify-center rounded-full bg-gradient-to-br from-green-700 to-emerald-600 px-1.5 text-xs font-bold text-white shadow-md ring-2 ring-white transition-transform group-hover:scale-110">
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
        </CardContent>
      </Card>
    </div>
  )
}