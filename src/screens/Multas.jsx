// pantalla_multas (Flujo A): listado previo de multas de una placa+entidad.
// Muestra una tarjeta por multa pendiente; al elegir una se va a /detalle.
// BIG2-M3: logo de la municipalidad al lado derecho del cuadro verde.
// Los datos vienen del backend (cache diario) — sin datos de demostración.
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useI18n } from '@/lib/i18n'
import { cargarInfracciones, sincronizarCacheDiario } from '@/lib/data'
import { formatearFecha, normalizarEntidad, formatoMonto } from '@/lib/core'

export default function Multas() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const placa = params.get('placa') ?? ''
  const entidad = params.get('entidad') ?? ''

  const [multas, setMultas] = useState(null)
  const [entidadLabel, setEntidadLabel] = useState('')
  const [entidadImagen, setEntidadImagen] = useState('')

  useEffect(() => {
    let activo = true
    async function cargar() {
      const [infracciones, entidades, reales] = await Promise.all([
        cargarInfracciones().catch(() => []),
        fetch('/entidades.json')
          .then((r) => r.json())
          .then((d) => d.entidades ?? [])
          .catch(() => []),
        sincronizarCacheDiario().catch(() => []),
      ])
      if (!activo) return

      const p = placa.trim().toUpperCase()
      // Aliases SOLO de la entidad seleccionada (id, corto, nombre, jurisdicción)
      // para matchear lo que manda el backend contra el id del query.
      const ent = entidades.find(
        (e) => e.id === entidad || normalizarEntidad(e.corto) === entidad
      )
      const aliasesEntidad = new Set()
      if (ent) {
        aliasesEntidad.add(normalizarEntidad(ent.id))
        aliasesEntidad.add(normalizarEntidad(ent.corto))
        aliasesEntidad.add(normalizarEntidad(ent.nombre))
        aliasesEntidad.add(normalizarEntidad(ent.jurisdiccion))
      }
      const lista = reales
        .filter(
          (m) =>
            String(m.placa ?? '').trim().toUpperCase() === p &&
            aliasesEntidad.has(normalizarEntidad(m.entidad)) &&
            m.estado !== 'pagada'
        )
        .map((m) => {
          const inf = infracciones.find((i) => i.id === m.infraccion)
          return {
            noMulta: m.no_multa ?? m.noMulta ?? m.numero ?? m.remision ?? '—',
            entidad: m.entidad ?? entidad,
            fecha: m.fecha ?? '',
            infraccion: m.infraccion ?? null,
            motivoLegal: inf
              ? `${inf.codigo}: ${inf.nombre}`
              : m.infraccion ?? '—',
            monto: m.monto ?? 0,
            tipoMulta: (m.tipo_multa ?? m.tipo ?? 'PAPELETA').toUpperCase(),
            estado: m.estado ?? 'pendiente',
          }
        })
      setMultas(lista)
      setEntidadLabel(ent?.corto ?? entidad.toUpperCase())
      setEntidadImagen(ent?.imagen ?? '')
    }
    cargar()
    return () => {
      activo = false
    }
  }, [placa, entidad])

  if (!multas) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Button
        variant="ghost"
        className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() =>
          navigate(`/resultados?placa=${encodeURIComponent(placa)}`)
        }
      >
        <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
        {t('volver')}
      </Button>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 shadow-lg">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        {entidadImagen && (
          <img
            src={entidadImagen}
            alt={entidadLabel}
            className="absolute right-4 top-1/2 h-16 w-16 -translate-y-1/2 rounded-xl border border-white/30 bg-white/90 object-contain p-1 shadow-lg"
          />
        )}
        <div className={`relative px-6 py-6 text-white ${entidadImagen ? 'pr-24' : ''}`}>
          <p className="text-xs font-medium uppercase tracking-widest text-white/70">
            {entidadLabel}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{t('multasListTitulo')}</h1>
          <p className="mt-1 text-sm text-white/80">
            {placa} · {t('multasListSub')}
          </p>
        </div>
      </div>

      {multas.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-muted-foreground dark:border-border dark:bg-card">
          {t('multasListSin')}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {multas.map((m) => {
            const esFoto = m.tipoMulta === 'FOTOVELOCIMETRO'
            const pendiente = m.estado !== 'pagada'
            return (
              <button
                key={`${m.entidad}-${m.noMulta}`}
                type="button"
                onClick={() =>
                  navigate(
                    `/detalle?placa=${encodeURIComponent(placa)}&entidad=${encodeURIComponent(
                      normalizarEntidad(m.entidad)
                    )}&noMulta=${encodeURIComponent(m.noMulta)}`
                  )
                }
                className="group w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99] dark:border-border dark:bg-card dark:hover:border-emerald-500/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          esFoto
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {m.tipoMulta}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        #{m.noMulta}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-1 text-sm font-semibold text-gray-900 dark:text-foreground">
                      {m.motivoLegal}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatearFecha(m.fecha)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-base font-bold text-gray-900 dark:text-foreground">
                      {formatoMonto(m.monto)}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        pendiente
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      }`}
                    >
                      {pendiente ? t('estadoPendiente') : t('estadoPagada')}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-emerald-700 transition-colors group-hover:text-emerald-800 dark:text-emerald-400 dark:group-hover:text-emerald-300">
                  {t('verDetalle')} →
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}