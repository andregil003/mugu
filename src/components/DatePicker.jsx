// DatePicker: calendario pop-up MODAL con fondo difuminado (blur overlay).
// BIG2-M5: el calendario ya no es un dropdown absoluto que se corta por las
// tarjetas — se abre centrado en pantalla sobre un backdrop con blur.
// Respeta min/max y muestra la fecha seleccionada formateada.
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons'
import { hoyISO, formatearFecha } from '@/lib/core'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

function isoDe(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(
    fecha.getDate()
  ).padStart(2, '0')}`
}

export default function DatePicker({
  value = '',
  onChange,
  min,
  max,
  placeholder,
  className,
}) {
  const [abierto, setAbierto] = useState(false)
  const [mes, setMes] = useState(() => {
    const base = value ? new Date(value) : new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const { t } = useI18n()

  // Al abrir, posicionar el calendario en el mes de la fecha seleccionada
  function abrir() {
    if (value) {
      const base = new Date(value)
      setMes(new Date(base.getFullYear(), base.getMonth(), 1))
    }
    setAbierto(true)
  }

  const primerDia = new Date(mes.getFullYear(), mes.getMonth(), 1)
  const offset = primerDia.getDay()
  const diasEnMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate()
  const hoy = hoyISO()

  function elegir(d) {
    const s = isoDe(d)
    if (min && s < min) return
    if (max && s > max) return
    onChange(s)
    setAbierto(false)
  }

  function cambiarMes(delta) {
    setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1))
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={abrir}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 text-sm transition hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none',
          value ? 'font-medium' : 'text-muted-foreground'
        )}
      >
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendarDays} className="h-4 w-4 text-primary" />
          {value ? formatearFecha(value) : (placeholder ?? t('dpPlaceholder'))}
        </span>
        <FontAwesomeIcon
          icon={faChevronRight}
          className={cn('h-3 w-3 text-muted-foreground transition-transform', abierto && 'rotate-90')}
        />
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop con blur: cierra al hacer click fuera */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setAbierto(false)}
            aria-hidden="true"
          />
          {/* Calendario modal */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('dpPlaceholder')}
            className="relative w-72 animate-in zoom-in-95 fade-in rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-border dark:bg-card"
          >
            {/* Cabecera del mes */}
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => cambiarMes(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-emerald-50 hover:text-emerald-700 active:scale-90 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                aria-label={t('dpMesAnterior')}
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
              </button>
              <span className="text-sm font-bold capitalize">
                {t('dpMeses')[mes.getMonth()]} {mes.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() => cambiarMes(1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-emerald-50 hover:text-emerald-700 active:scale-90 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                aria-label={t('dpMesSiguiente')}
              >
                <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {t('dpDias').map((d, i) => (
                <span key={i} className="py-1 text-[10px] font-bold uppercase text-muted-foreground">
                  {d}
                </span>
              ))}
              {/* Celdas vacías antes del día 1 */}
              {Array.from({ length: offset }).map((_, i) => (
                <span key={`e${i}`} />
              ))}
              {/* Días del mes */}
              {Array.from({ length: diasEnMes }).map((_, i) => {
                const d = new Date(mes.getFullYear(), mes.getMonth(), i + 1)
                const s = isoDe(d)
                const deshabilitado = (min && s < min) || (max && s > max)
                const seleccionado = s === value
                const esHoy = s === hoy
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={deshabilitado}
                    onClick={() => elegir(d)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-sm transition active:scale-90',
                      deshabilitado
                        ? 'cursor-not-allowed text-gray-300 dark:text-muted-foreground'
                        : seleccionado
                          ? 'bg-emerald-600 font-bold text-white shadow-md'
                          : esHoy
                            ? 'font-bold text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:ring-emerald-500 dark:hover:bg-emerald-950/40'
                            : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-foreground dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400'
                    )}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}