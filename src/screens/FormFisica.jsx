// pantalla_formulario_fisica (Flujo B): búsqueda con datos del documento impreso.
// - Tipo de placa desplegable (siglas) + input del resto (BIG 4.7)
// - Fechas con calendario (date picker) en vez de escritura manual (BIG 4.8)
// - Si no se encuentra la multa → aviso de espera de 3 días (delay de digitación)
//   SOLO aquí (registro manual); "tus multas" no muestra este aviso.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DatePicker from '@/components/DatePicker'
import PageHero from '@/components/PageHero'
import { useI18n } from '@/lib/i18n'
import {
  validarPlaca,
  validarFechaNoFutura,
  hoyISO,
  normalizarEntidad,
  PREFIJOS_PLACA,
} from '@/lib/core'
import { sincronizarCacheDiario } from '@/lib/data'

export default function FormFisica() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [tipoPlaca, setTipoPlaca] = useState('P')
  const [restoPlaca, setRestoPlaca] = useState('')
  const [noMulta, setNoMulta] = useState('')
  const [fecha, setFecha] = useState('')
  const [fechaNotif, setFechaNotif] = useState('')
  const [entidad, setEntidad] = useState('')
  const [entidades, setEntidades] = useState([])
  const [error, setError] = useState('')
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    fetch('/entidades.json')
      .then((r) => r.json())
      .then((d) => setEntidades(d.entidades ?? []))
      .catch(() => {})
  }, [])

  async function buscar(e) {
    e.preventDefault()
    setError('')

    const placaCompleta = `${tipoPlaca}${restoPlaca}`.toUpperCase()
    if (!validarPlaca(placaCompleta)) {
      setError(t('errorPlacaInvalida'))
      return
    }
    if (!/^\d{6}$/.test(noMulta.trim())) {
      setError(t('errorNoMulta6'))
      return
    }
    if (!validarFechaNoFutura(fecha)) {
      setError(t('errorFechaInvalida'))
      return
    }
    if (!entidad) {
      setError(t('errorSeleccionaEntidad'))
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
      // Delay de digitación de remisiones: esperar 3 días (solo registro manual)
      setError(t('errorNoEncontrado3dias'))
      return
    }

    navigate(
      `/detalle?placa=${encodeURIComponent(placaCompleta)}&fecha=${fecha}&entidad=${entidad}`
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <Button
        variant="ghost"
        className="mb-2 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() => navigate('/menu')}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
        {t('volver')}
      </Button>
      <PageHero
        eyebrow={t('appNombre')}
        titulo={t('formFisicaTitulo')}
        subtitulo={t('formFisicaSubtitulo')}
      />
      <Card className="mt-4 rounded-2xl shadow-sm transition-shadow hover:shadow-md">
        <CardContent>
          <form onSubmit={buscar} className="space-y-4">
            {/* Placa: tipo (siglas) + resto */}
            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelPlaca')}</label>
              <div className="flex gap-2">
                <Select value={tipoPlaca} onValueChange={setTipoPlaca}>
                  <SelectTrigger
                    className="h-11 w-28 shrink-0"
                    aria-label={t('tipoPlacaLabel')}
                  >
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
                  onChange={(e) =>
                    setRestoPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
                  }
                  placeholder="123ABC"
                  className="h-11 flex-1 font-mono text-lg font-semibold tracking-widest"
                  aria-label={t('labelPlaca')}
                  required
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('tipoPlacaLabel')}: {tipoPlaca} + {restoPlaca || '123ABC'}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelNoMulta')}</label>
              <Input
                value={noMulta}
                onChange={(e) => setNoMulta(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('placeholderNoMulta')}
                inputMode="numeric"
                maxLength={6}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelFecha')}</label>
              <DatePicker
                value={fecha}
                onChange={setFecha}
                min="2020-01-01"
                max={hoyISO()}
                placeholder={t('labelFecha')}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">{t('labelFechaNotificacion')}</label>
              <DatePicker
                value={fechaNotif}
                onChange={setFechaNotif}
                min="2020-01-01"
                max={hoyISO()}
                placeholder={t('labelFechaNotificacion')}
              />
            </div>

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

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 animate-in slide-in-from-top-1">
                <FontAwesomeIcon icon={faInfoCircle} className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-xl bg-primary py-6 text-sm font-bold shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
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