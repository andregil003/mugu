// pantalla_resultados_muni (Flujo A): grilla de entidades al estilo portal SAT.
// Cada botón muestra la imagen de la entidad + badge (notificación estilo iPhone).
// Con multas → rojo activo y navegable. Sin multas → gris y no seleccionable.
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { sincronizarCacheDiario, forzarActualizacion } from '@/lib/data'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { inferirTipoVehiculo } from '@/lib/core'

// Fallback si el backend de Sheets no está configurado todavía (modo demo)
const MOCK_MULTAS = { emetra: 2, pnc: 1, emixtra: 1 }

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
      // Sin backend conectado → datos de demostración
      if (Object.keys(conteos).length === 0) {
        Object.assign(conteos, MOCK_MULTAS)
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
    <div className="mx-auto max-w-lg px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{t('municipiosTitulo')}</CardTitle>
          {tipoVehiculo && (
            <p className="text-center text-sm text-muted-foreground capitalize">
              {t(TIPO_LABEL[tipoVehiculo] ?? 'tipoOtro')} · {placa}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
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
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
                    activo
                      ? 'cursor-pointer border-gray-300 bg-white shadow-sm hover:border-blue-500 hover:shadow'
                      : 'cursor-not-allowed border-gray-200 bg-gray-100'
                  }`}
                >
                  <span className="relative block h-16 w-full">
                    <img
                      src={e.imagen}
                      alt={`${e.corto} — ${e.jurisdiccion}`}
                      loading="lazy"
                      className={`mx-auto h-16 w-16 rounded-md border border-gray-200 object-contain p-0.5 ${
                        activo ? '' : 'grayscale opacity-60'
                      }`}
                    />
                    {activo && (
                      <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white shadow">
                        {n}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-[11px] font-medium leading-tight ${
                      activo ? 'text-gray-800' : 'text-gray-500'
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
            className="w-full"
            onClick={actualizar}
            disabled={actualizando}
          >
            {actualizando ? 'Actualizando…' : '↻ Actualizar datos'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}