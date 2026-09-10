// pantalla_resultados_muni (Flujo A): grilla de entidades al estilo portal SAT.
// Cada botón muestra la imagen de la entidad + badge (notificación estilo iPhone).
// Con multas → rojo activo y navegable. Sin multas → gris y no seleccionable.
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { sincronizarCacheDiario, forzarActualizacion } from '@/lib/data'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { inferirTipoVehiculo } from '@/lib/core'

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

function normalizarEntidad(nombre = '') {
  return nombre.toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

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
    <div className="mx-auto max-w-lg px-4 py-6">
      <Button
        variant="ghost"
        className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() => navigate('/buscar')}
      >
        ← {t('volver')}
      </Button>

      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 shadow-lg">
        <div className="px-5 py-5 text-white">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-100">
            {placa}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{t('municipiosTitulo')}</h1>
          {tipoVehiculo && (
            <p className="mt-1 text-sm text-blue-100">
              {t(TIPO_LABEL[tipoVehiculo] ?? 'tipoOtro')}
            </p>
          )}
        </div>
      </div>

      <Card className="mt-4 rounded-2xl shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="space-y-4 py-5">
          <div className="grid grid-cols-3 gap-3">
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
                      `/detalle?placa=${encodeURIComponent(placa)}&entidad=${e.id}`
                    )
                  }
                  title={`${e.corto}${activo ? ` — ${n} multa(s)` : ' — sin multas'}`}
                  className={`group flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all duration-200 ${
                    activo
                      ? 'cursor-pointer border-gray-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 active:scale-95'
                      : 'cursor-not-allowed border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className="relative block h-16 w-full">
                    <img
                      src={e.imagen}
                      alt={`${e.corto} — ${e.jurisdiccion}`}
                      loading="lazy"
                      className={`mx-auto h-16 w-16 rounded-lg border border-gray-200 object-contain p-0.5 transition-all duration-200 ${
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
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] leading-none text-gray-400 ring-2 ring-white">
                        — 
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-[11px] font-medium leading-tight transition-colors ${
                      activo
                        ? 'text-gray-800 group-hover:text-blue-700'
                        : 'text-gray-400'
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
            className="w-full transition hover:bg-blue-50 hover:text-blue-700 active:scale-[0.98]"
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