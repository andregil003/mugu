// pantalla_formulario_fisica (Flujo B): búsqueda con datos del documento impreso.
// Si no se encuentra la multa → mensaje de espera de 3 días (delay de digitación).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { useI18n } from '@/lib/i18n'
import { validarPlaca, validarFechaNoFutura } from '@/lib/core'
import { sincronizarCacheDiario } from '@/lib/data'

const ENTIDADES = [
  { id: 'emetra', nombre: 'EMETRA' },
  { id: 'pnc', nombre: 'PNC' },
  { id: 'muniguate', nombre: 'MuniGuate' },
]

export default function FormFisica() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [placa, setPlaca] = useState('')
  const [noMulta, setNoMulta] = useState('')
  const [fecha, setFecha] = useState('')
  const [fechaNotif, setFechaNotif] = useState('')
  const [entidad, setEntidad] = useState('')
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)

  async function buscar(e) {
    e.preventDefault()
    setError('')

    if (!validarPlaca(placa.trim().toUpperCase())) {
      setError('Formato de placa inválido')
      return
    }
    if (!noMulta.trim()) {
      setError('Falta el número de multa')
      return
    }
    if (!validarFechaNoFutura(fecha)) {
      setError('Fecha de multa inválida')
      return
    }
    if (!entidad) {
      setError('Seleccioná la municipalidad')
      return
    }

    setBuscando(true)
    const multas = await sincronizarCacheDiario()
    setBuscando(false)

    const encontrada = multas.some(
      (m) =>
        m.placa === placa.trim().toUpperCase() &&
        m.entidad.toLowerCase() === entidad
    )

    if (!encontrada) {
      // Delay de digitación de remisiones: esperar 3 días
      setError(t('errorNoEncontrado'))
      return
    }

    navigate(
      `/detalle?placa=${encodeURIComponent(placa.trim().toUpperCase())}&fecha=${fecha}&entidad=${entidad}`
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('formFisicaTitulo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={buscar} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelPlaca')}</label>
              <Input
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="P123ABC"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelNoMulta')}</label>
              <Input
                value={noMulta}
                onChange={(e) => setNoMulta(e.target.value)}
                placeholder="000-0000"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelFecha')}</label>
              <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelFechaNotificacion')}</label>
              <Input type="date" value={fechaNotif} onChange={(e) => setFechaNotif(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelMunicipalidad')}</label>
              <Select value={entidad} onValueChange={setEntidad}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('labelMunicipalidad')} />
                </SelectTrigger>
                <SelectContent>
                  {ENTIDADES.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={buscando}>
              {buscando ? '…' : t('botonBuscar')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}