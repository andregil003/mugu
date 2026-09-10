// P1: Formulario guiado de la boleta + "¿Sos propietario?" + "¿Vos manejabas?".
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/lib/i18n'
import { validarFechaNoFutura } from '@/lib/core'

const MOCK_INFRACCIONES = [
  { id: 'semaforo_rojo', nombre: 'No respetar semáforo en rojo' },
  { id: 'estacionamiento_prohibido', nombre: 'Estacionar en lugar prohibido' },
  { id: 'licencia_vencida', nombre: 'Conducir con licencia vencida' },
]

export default function Form() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [fecha, setFecha] = useState('')
  const [entidad, setEntidad] = useState('')
  const [infraccion, setInfraccion] = useState('')
  const [propietario, setPropietario] = useState(false)
  const [manejabas, setManejabas] = useState(false)
  const [error, setError] = useState('')

  function continuar(e) {
    e.preventDefault()
    if (!validarFechaNoFutura(fecha)) {
      setError('La fecha no puede ser futura')
      return
    }
    if (!entidad || !infraccion) {
      setError('Completá todos los campos')
      return
    }
    navigate(`/explicador?fecha=${fecha}&entidad=${entidad}&infraccion=${infraccion}`)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Datos de la boleta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={continuar} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelFecha')}</label>
              <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelEntidad')}</label>
              <Select value={entidad} onValueChange={setEntidad}>
                <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="emetra">EMETRA</SelectItem>
                  <SelectItem value="pnc">PNC</SelectItem>
                  <SelectItem value="muniguate">MuniGuate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelInfraccion')}</label>
              <Select value={infraccion} onValueChange={setInfraccion}>
                <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                <SelectContent>
                  {MOCK_INFRACCIONES.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={propietario} onCheckedChange={setPropietario} />
              {t('labelPropietario')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={manejabas} onCheckedChange={setManejabas} />
              {t('labelManejabas')}
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">{t('botonExplicarMulta')}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}