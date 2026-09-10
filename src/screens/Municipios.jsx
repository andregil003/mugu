// pantalla_resultados_muni (Flujo A): gris=sin multas, color=con multas, badge con número.
// Usa el cache diario (1 fetch por día) de Google Sheets + Apps Script.
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotate } from '@fortawesome/free-solid-svg-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { sincronizarCacheDiario, forzarActualizacion } from '@/lib/data'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { inferirTipoVehiculo } from '@/lib/core'

// Fallback si el backend de Sheets no está configurado todavía
const MOCK_MUNICIPIOS = [
  { id: 'emetra', nombre: 'EMETRA', multas: 2 },
  { id: 'pnc', nombre: 'PNC', multas: 0 },
  { id: 'muniguate', nombre: 'MuniGuate', multas: 1 },
]

const NOMBRES_ENTIDAD = {
  emetra: 'EMETRA',
  pnc: 'PNC',
  muniguate: 'MuniGuate',
}

export default function Municipios() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [placas] = useLocalStorage('placas', [])
  const [municipios, setMunicipios] = useState(MOCK_MUNICIPIOS)
  const [tipoVehiculo, setTipoVehiculo] = useState('')
  const [actualizando, setActualizando] = useState(false)

  // Placa viene del query param (?placa=) o de la última guardada
  const placa = params.get('placa') ?? placas[placas.length - 1] ?? ''

  useEffect(() => {
    let activo = true
    async function cargar() {
      if (!placa) return
      setTipoVehiculo(inferirTipoVehiculo(placa))

      const multas = await sincronizarCacheDiario()
      if (!activo) return
      if (multas.length === 0) return // fallback al mock

      // Agrupar por entidad y contar (solo pendientes)
      const conteo = {}
      multas
        .filter((m) => m.placa === placa && m.estado !== 'pagada')
        .forEach((m) => {
          const id = m.entidad.toLowerCase()
          conteo[id] = (conteo[id] ?? 0) + 1
        })

      if (Object.keys(conteo).length === 0) return // fallback al mock

      setMunicipios(
        Object.entries(conteo).map(([id, n]) => ({
          id,
          nombre: NOMBRES_ENTIDAD[id] ?? id,
          multas: n,
        }))
      )
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
    // recargar vista
    window.location.reload()
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{t('municipiosTitulo')}</CardTitle>
          {tipoVehiculo && (
            <p className="text-center text-sm text-muted-foreground capitalize">
              {placa} · {tipoVehiculo}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {municipios.map((m) => (
            <button
              key={m.id}
              onClick={() =>
                navigate(
                  `/detalle?placa=${encodeURIComponent(placa)}&entidad=${m.id}`
                )
              }
              className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition ${
                m.multas > 0
                  ? 'border-red-300 bg-red-50 hover:bg-red-100'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span className="font-medium">{m.nombre}</span>
              {m.multas > 0 ? (
                <Badge variant="destructive">{m.multas} {t('municipiosConMultas')}</Badge>
              ) : (
                <Badge variant="secondary">{t('municipiosSinMultas')}</Badge>
              )}
            </button>
          ))}
          <Button
            variant="ghost"
            className="w-full"
            onClick={actualizar}
            disabled={actualizando}
          >
            {actualizando ? 'Actualizando…' : <><FontAwesomeIcon icon={faRotate} className="mr-2" />Actualizar datos</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}