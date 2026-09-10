// pantalla_resultados_muni (Flujo A): grilla de entidades al estilo portal SAT.
// Cada botón muestra la imagen de la entidad + badge con la cantidad de multas.
// Con multas → tarjeta a color y navegable a /multas (listado). Sin multas → gris.
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { sincronizarCacheDiario, forzarActualizacion } from '@/lib/data'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate } from '@fortawesome/free-solid-svg-icons'
import { inferirTipoVehiculo, normalizarEntidad } from '@/lib/core'
import ModuleLayout from '@/components/layout/ModuleLayout'

// Etiquetas visibles por tipo de vehículo (claves de i18n)
const TIPO_LABEL = {
  particular: 'tipoParticular',
  motocicleta: 'tipoMotocicleta',
  mototaxi: 'tipoMototaxi',
  alquiler: 'tipoAlquiler',
  comercial: 'tipoComercial',
  urbano: 'tipoUrbano',
  extraurbano: 'tipoExtraurbano',
  remolque: 'tipoRemolque',
  agricola: 'tipoAgricola',
  oficial: 'tipoOficial',
  diplomatico: 'tipoDiplomatico',
  consular: 'tipoConsular',
  mision_internacional: 'tipoMisionInternacional',
  distribuidor: 'tipoDistribuidor',
  bus: 'tipoBus',
  taxi: 'tipoTaxi',
  otro: 'tipoOtro',
}

// Acento de color por entidad (se va rotando con el índice)
const COLORES = [
  { tarjeta: 'border-rose-200 bg-gradient-to-b from-rose-50/80 to-white hover:border-rose-400', texto: 'hover:text-rose-700', haz: 'hover:shadow-rose-500/10' },
  { tarjeta: 'border-amber-200 bg-gradient-to-b from-amber-50/80 to-white hover:border-amber-400', texto: 'hover:text-amber-700', haz: 'hover:shadow-amber-500/10' },
  { tarjeta: 'border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white hover:border-emerald-400', texto: 'hover:text-emerald-700', haz: 'hover:shadow-emerald-500/10' },
  { tarjeta: 'border-sky-200 bg-gradient-to-b from-sky-50/80 to-white hover:border-sky-400', texto: 'hover:text-sky-700', haz: 'hover:shadow-sky-500/10' },
  { tarjeta: 'border-violet-200 bg-gradient-to-b from-violet-50/80 to-white hover:border-violet-400', texto: 'hover:text-violet-700', haz: 'hover:shadow-violet-500/10' },
  { tarjeta: 'border-fuchsia-200 bg-gradient-to-b from-fuchsia-50/80 to-white hover:border-fuchsia-400', texto: 'hover:text-fuchsia-700', haz: 'hover:shadow-fuchsia-500/10' },
  { tarjeta: 'border-teal-200 bg-gradient-to-b from-teal-50/80 to-white hover:border-teal-400', texto: 'hover:text-teal-700', haz: 'hover:shadow-teal-500/10' },
  { tarjeta: 'border-indigo-200 bg-gradient-to-b from-indigo-50/80 to-white hover:border-indigo-400', texto: 'hover:text-indigo-700', haz: 'hover:shadow-indigo-500/10' },
  { tarjeta: 'border-cyan-200 bg-gradient-to-b from-cyan-50/80 to-white hover:border-cyan-400', texto: 'hover:text-cyan-700', haz: 'hover:shadow-cyan-500/10' },
  { tarjeta: 'border-lime-200 bg-gradient-to-b from-lime-50/80 to-white hover:border-lime-500', texto: 'hover:text-lime-700', haz: 'hover:shadow-lime-500/10' },
  { tarjeta: 'border-orange-200 bg-gradient-to-b from-orange-50/80 to-white hover:border-orange-400', texto: 'hover:text-orange-700', haz: 'hover:shadow-orange-500/10' },
]

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
    <ModuleLayout>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Button
          variant="ghost"
          className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
          onClick={() => navigate('/buscar')}
        >
          ← {t('volver')}
        </Button>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 shadow-lg">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative px-6 py-6 text-white">
            <p className="text-xs font-medium uppercase tracking-widest text-white/70">
              {placa}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{t('municipiosTitulo')}</h1>
            {tipoVehiculo && (
              <p className="mt-1 text-sm text-white/80">
                {t(TIPO_LABEL[tipoVehiculo] ?? 'tipoOtro')}
              </p>
            )}
          </div>
        </div>

        <Card className="mt-5 rounded-3xl bg-white/70 shadow-sm backdrop-blur transition-shadow hover:shadow-md">
          <CardContent className="space-y-4 py-5">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 lg:gap-4">
              {entidades.map((e, i) => {
                const n = conteo[e.id] ?? 0
                const activo = n > 0
                const color = COLORES[i % COLORES.length]
                return (
                  <button
                    key={e.id}
                    type="button"
                    disabled={!activo}
                    onClick={() =>
                      navigate(`/multas?placa=${encodeURIComponent(placa)}&entidad=${e.id}`)
                    }
                    title={`${e.corto}${activo ? ` — ${n} multa(s)` : ' — sin multas'}`}
                    className={`group flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all duration-200 ${
                      activo
                        ? `cursor-pointer shadow-sm ${color.tarjeta} hover:-translate-y-0.5 hover:shadow-lg ${color.haz} active:scale-95`
                        : 'cursor-not-allowed border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span className="relative block h-16 w-full">
                      <img
                        src={e.imagen}
                        alt={`${e.corto} — ${e.jurisdiccion}`}
                        loading="lazy"
                        className={`mx-auto h-16 w-16 rounded-xl border border-gray-200 object-contain bg-white p-0.5 transition-all duration-200 ${
                          activo ? 'group-hover:scale-105 group-hover:shadow-md' : 'grayscale opacity-50'
                        }`}
                      />
                      {activo ? (
                        <span className="absolute -right-2 -top-2 flex h-6 min-w-6 animate-in zoom-in-95 fade-in items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 px-1.5 text-xs font-bold text-white shadow-md ring-2 ring-white transition-transform group-hover:scale-110">
                          {n}
                        </span>
                      ) : (
                        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] leading-none text-gray-400 ring-2 ring-white">
                          —
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-[11px] font-medium leading-tight transition-colors ${
                        activo ? `text-gray-800 ${color.texto}` : 'text-gray-400'
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
              className="w-full transition hover:bg-violet-50 hover:text-violet-700 active:scale-[0.98]"
              onClick={actualizar}
              disabled={actualizando}
            >
              {actualizando ? t('actualizando') : <><FontAwesomeIcon icon={faRotate} className="mr-2" />{t('actualizarDatos')}</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  )
}