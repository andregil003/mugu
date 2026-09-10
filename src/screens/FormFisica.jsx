// pantalla_formulario_fisica (Flujo B): búsqueda con datos del documento impreso.
// Validaciones locales:
//   1. Placa: menú desplegable de tipo (sigla) + renglón con números y 3 letras.
//      Formato final: TIPO + 3 números + 3 letras (ej. P123ABC).
//   2. Número de multa: únicamente 6 dígitos.
//   3/4. Fechas con calendario (input type=date + botón), notificación opcional.
//   5. Municipalidades/emisores (entidades.json).
// Match contra el backend real (cache diario); si no aparece → espera de 3 días.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
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
import {
  SIGLAS_PLACA,
  validarSigla,
  validarPlaca,
  validarFechaNoFutura,
  componerPlaca,
} from '@/lib/core'
import { sincronizarCacheDiario } from '@/lib/data'

function normalizarEntidad(nombre = '') {
  return nombre.toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

const HOY = new Date().toISOString().slice(0, 10)

export default function FormFisica() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [tipoPlaca, setTipoPlaca] = useState('')
  const [restoPlaca, setRestoPlaca] = useState('')
  const [noMulta, setNoMulta] = useState('')
  const [fecha, setFecha] = useState('')
  const [fechaNotif, setFechaNotif] = useState('')
  const [entidad, setEntidad] = useState('')
  const [entidades, setEntidades] = useState([])
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)

  const placaCompleta = componerPlaca(tipoPlaca, restoPlaca)

  useEffect(() => {
    fetch('/entidades.json')
      .then((r) => r.json())
      .then((d) => setEntidades(d.entidades ?? []))
      .catch(() => {})
  }, [])

  function onRestoPlacaChange(e) {
    // Solo letras y números; mayúsculas; máx. 6 caracteres (3 números + 3 letras)
    setRestoPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
  }

  function onNoMultaChange(e) {
    // Únicamente 6 dígitos
    setNoMulta(e.target.value.replace(/\D/g, '').slice(0, 6))
  }

  async function buscar(e) {
    e.preventDefault()
    setError('')

    if (!validarSigla(tipoPlaca)) {
      setError('Seleccioná el tipo de placa')
      return
    }
    if (!validarPlaca(placaCompleta)) {
      setError('El formato de placa es inválido: tipo + 3 números + 3 letras (ej. P123ABC)')
      return
    }
    if (!/^\d{6}$/.test(noMulta.trim())) {
      setError('El número de multa debe tener exactamente 6 dígitos')
      return
    }
    if (!validarFechaNoFutura(fecha)) {
      setError('Seleccioná una fecha de infracción válida (no puede ser futura)')
      return
    }
    if (fechaNotif && !validarFechaNoFutura(fechaNotif)) {
      setError('La fecha de notificación no puede ser futura')
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
        m.placa === placaCompleta &&
        normalizarEntidad(m.entidad) === entidad &&
        (!m.no_multa || m.no_multa === noMulta.trim())
    )

    if (!encontrada) {
      // Delay de digitación de remisiones: esperar 3 días
      setError(t('errorNoEncontrado'))
      return
    }

    const params = new URLSearchParams({ placa: placaCompleta, fecha })
    if (entidad) params.set('entidad', entidad)
    navigate(`/detalle?${params.toString()}`)
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
              <label className="mb-1 block text-sm font-medium">{t('labelTipoPlaca')}</label>
              <Select value={tipoPlaca} onValueChange={setTipoPlaca}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('labelTipoPlaca')} />
                </SelectTrigger>
                <SelectContent>
                  {SIGLAS_PLACA.map((s) => (
                    <SelectItem key={s.sigla} value={s.sigla}>
                      {s.sigla} — {s.tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelPlacaResto')}</label>
              <Input
                value={restoPlaca}
                onChange={onRestoPlacaChange}
                placeholder="123ABC"
                inputMode="text"
                autoComplete="off"
                maxLength={6}
                required
              />
              {placaCompleta && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('labelPlacaPreview')} <span className="font-semibold">{placaCompleta}</span>
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelNoMulta')}</label>
              <Input
                value={noMulta}
                onChange={onNoMultaChange}
                placeholder="123456"
                inputMode="numeric"
                maxLength={6}
                required
              />
            </div>
            <CampoFecha
              id="fecha-infraccion"
              label={t('labelFecha')}
              value={fecha}
              onChange={setFecha}
              abrir={t('abrirCalendario')}
            />
            <CampoFecha
              id="fecha-notificacion"
              label={t('labelFechaNotificacion')}
              value={fechaNotif}
              onChange={setFechaNotif}
              abrir={t('abrirCalendario')}
            />
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelMunicipalidad')}</label>
              <Select value={entidad} onValueChange={setEntidad}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('labelMunicipalidad')} />
                </SelectTrigger>
                <SelectContent>
                  {entidades.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.corto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={buscando}
            >
              {buscando ? '…' : t('botonBuscar')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function CampoFecha({ id, label, value, onChange, abrir }) {
  function abrirCalendario() {
    const input = document.getElementById(id)
    if (typeof input?.showPicker === 'function') {
      input.showPicker()
    } else {
      input?.focus()
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <div className="relative">
        <Input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          max={HOY}
          className="pr-10"
        />
        <button
          type="button"
          onClick={abrirCalendario}
          aria-label={abrir}
          title={abrir}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-lg text-muted-foreground"
        >
          <FontAwesomeIcon icon={faCalendarDays} />
        </button>
      </div>
    </div>
  )
}