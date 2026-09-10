// pantalla_multas (Flujo A): listado previo de multas de una placa+entidad.
// Muestra una tarjeta por multa pendiente; al elegir una se va a /detalle.
// Si el backend no está conectado, usa los datos de demostración.
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { cargarInfracciones, sincronizarCacheDiario } from '@/lib/data'
import { listarMultas } from '@/lib/demo'
import { formatearFecha, normalizarEntidad } from '@/lib/core'
import ModuleLayout from '@/components/layout/ModuleLayout'

function formatoMonto(monto) {
  const n = Number(String(monto ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? `Q${n.toFixed(2)}` : '—'
}

export default function Multas() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const placa = params.get('placa') ?? ''
  const entidad = params.get('entidad') ?? ''

  const [multas, setMultas] = useState(null)
  const [entidadLabel, setEntidadLabel] = useState('')

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

      const lista = listarMultas(placa, entidad, reales).map((m) => {
        const inf = infracciones.find((i) => i.id === m.infraccion)
        return {
          ...m,
          motivoLegal: inf
            ? `ARTÍCULO ${inf.articulo}: ${inf.nombre}`
            : m.infraccion ?? '—',
        }
      })
      const ent = entidades.find(
        (e) => e.id === entidad || normalizarEntidad(e.corto) === entidad
      )
      setMultas(lista)
      setEntidadLabel(ent?.corto ?? entidad.toUpperCase())
    }
    cargar()
    return () => {
      activo = false
    }
  }, [placa, entidad])

  if (!multas) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        Cargando…
      </div>
    )
  }

  return (
    <ModuleLayout>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Button
          variant="ghost"
          className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
          onClick={() =>
            navigate(`/resultados?placa=${encodeURIComponent(placa)}`)
          }
        >
          ← {t('volver')}
        </Button>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 shadow-lg">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative px-6 py-6 text-white">
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
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-muted-foreground">
            {t('multasListSin')}
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {multas.map((m) => {
              const esFoto = m.tipoMulta === 'FOTO-MULTA'
              const pendiente = m.estado !== 'pagada'
              return (
                <button
                  key={`${m.entidad}-${m.noMulta}`}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/detalle?placa=${encodeURIComponent(placa)}&entidad=${
                        m.entidad
                      }&noMulta=${encodeURIComponent(m.noMulta)}`
                    )
                  }
                  className="group w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-fuchsia-300 hover:shadow-lg hover:shadow-fuchsia-500/10 active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            esFoto
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {m.tipoMulta}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          #{m.noMulta}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-1 text-sm font-semibold text-gray-900">
                        {m.motivoLegal}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatearFecha(m.fecha)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-base font-bold text-gray-900">
                        {formatoMonto(m.monto)}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          pendiente
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {pendiente ? t('estadoPendiente') : t('estadoPagada')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-1 text-xs font-semibold text-fuchsia-600 transition-colors group-hover:text-fuchsia-700">
                    {t('verDetalle')} →
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </ModuleLayout>
  )
}