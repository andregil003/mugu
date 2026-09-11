// pantalla_info_apelacion: guía para apelar en el juzgado de tránsito.
// Muestra las 2 gestiones (Oposición / Prescripción) con propósito, lugar,
// documentos, contenido del escrito y plazo — datos de public/apelaciones.json
// (fuente: Decreto 33-2024 + Reglamento 273-98).
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faScaleBalanced,
  faHourglassHalf,
  faLocationDot,
  faFileLines,
  faPenToSquare,
  faClock,
} from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '@/lib/i18n'

export default function Apelacion() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const placa = params.get('placa') ?? ''
  const entidad = params.get('entidad') ?? ''

  const [gestiones, setGestiones] = useState(null)

  useEffect(() => {
    let activo = true
    fetch('/apelaciones.json')
      .then((r) => r.json())
      .then((d) => {
        if (activo) setGestiones(d.gestiones ?? [])
      })
      .catch(() => {
        if (activo) setGestiones([])
      })
    return () => {
      activo = false
    }
  }, [])

  const ICONOS = {
    oposicion: faScaleBalanced,
    prescripcion: faHourglassHalf,
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Button
        variant="ghost"
        className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() =>
          navigate(
            `/detalle?placa=${encodeURIComponent(placa)}&entidad=${encodeURIComponent(entidad)}`
          )
        }
      >
        ← {t('volver')}
      </Button>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700 via-amber-600 to-orange-500 shadow-lg">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative px-6 py-7 text-white">
          <h1 className="text-2xl font-bold">{t('apelacionTitulo')}</h1>
          <p className="mt-1 text-sm text-white/80">{t('apelacionTexto')}</p>
        </div>
      </div>

      {!gestiones ? (
        <div className="mt-6 text-sm text-muted-foreground">Cargando…</div>
      ) : (
        <div className="mt-5 space-y-5">
          {gestiones.map((g) => (
            <section
              key={g.id}
              className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
            >
              {/* Encabezado de la gestión */}
              <div className="flex items-start gap-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white px-5 py-4">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <FontAwesomeIcon icon={ICONOS[g.id] ?? faScaleBalanced} className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{g.nombre}</h2>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    {g.subtitulo}
                  </p>
                </div>
              </div>

              <div className="space-y-4 px-5 py-4">
                {/* Propósito */}
                <p className="text-sm leading-relaxed text-gray-700">{g.proposito}</p>

                {/* Lugar de presentación */}
                <div className="rounded-2xl border-l-4 border-amber-400 bg-amber-50/60 p-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-800">
                    <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" />
                    {t('apelacionLugar')}
                  </p>
                  <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs leading-relaxed text-amber-900/90">
                    {g.lugar_de_presentacion.dependencias.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                  <p className="mt-1.5 text-[11px] italic text-amber-700/80">
                    {t('apelacionCriterio')}: {g.lugar_de_presentacion.criterio}
                  </p>
                </div>

                {/* Documentos requeridos */}
                <div className="rounded-2xl border-l-4 border-emerald-400 bg-emerald-50/60 p-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-800">
                    <FontAwesomeIcon icon={faFileLines} className="h-3.5 w-3.5" />
                    {t('apelacionDocumentos')}
                  </p>
                  <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs leading-relaxed text-emerald-900/90">
                    {g.documentos_y_pruebas_requeridos.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>

                {/* Contenido del escrito */}
                <div className="rounded-2xl border-l-4 border-sky-400 bg-sky-50/60 p-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-800">
                    <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" />
                    {t('apelacionContenido')}
                  </p>
                  <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs leading-relaxed text-sky-900/90">
                    {g.contenido_del_escrito.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>

                {/* Plazo */}
                <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50/70 px-3 py-2.5">
                  <FontAwesomeIcon icon={faClock} className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-xs font-semibold leading-relaxed text-red-800">
                    {t('apelacionPlazo')}: {g.plazo_de_presentacion}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}