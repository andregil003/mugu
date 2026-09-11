// pantalla_tabla_informativa (Flujo C): "No entiendo mi multa".
// Buscador + filtro por tipo de multa (papeleta/cepo/fotovelocímetro) +
// paginación de 10 + montos con descuento.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLightbulb,
  faMagnifyingGlass,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faAnglesLeft,
  faAnglesRight,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHero from '@/components/PageHero'
import { useI18n } from '@/lib/i18n'
import { cargarInfracciones } from '@/lib/data'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

const TIPOS_MULTA = [
  { id: 'papeleta', clave: 'infoTipoPapeleta', color: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-400' },
  { id: 'cepo', clave: 'infoTipoCepo', color: 'border-gray-300 bg-gray-100 text-gray-700 dark:border-border dark:bg-muted dark:text-muted-foreground' },
  { id: 'fotovelocimetro', clave: 'infoTipoFotovelocimetro', color: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-950/40 dark:text-sky-400' },
]

// El catálogo no trae tipo_multa: se deriva por heurística del texto.
function tipoMultaDe(i) {
  const texto = `${i.nombre ?? ''} ${i.descripcion ?? ''} ${i.id ?? ''}`.toLowerCase()
  if (/velocidad|veloc/.test(texto)) return 'fotovelocimetro'
  if (/cepo|estacionamiento|parqueo/.test(texto)) return 'cepo'
  return 'papeleta'
}

export default function Info() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [infracciones, setInfracciones] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [tipoMulta, setTipoMulta] = useState('')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    cargarInfracciones().then(setInfracciones).catch(() => {})
  }, [])

  function cambiarBusqueda(v) {
    setBusqueda(v)
    setPagina(1)
  }

  function cambiarTipoMulta(v) {
    setTipoMulta(v)
    setPagina(1)
  }

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return infracciones.filter((i) => {
      if (tipoMulta && tipoMultaDe(i) !== tipoMulta) return false
      if (!q) return true
      const texto = `${i.nombre ?? ''} ${i.descripcion ?? ''} ${i.id ?? ''} ${i.codigo ?? ''} ${i.articulo ?? ''}`.toLowerCase()
      return texto.includes(q)
    })
  }, [infracciones, busqueda, tipoMulta])

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE))
  const paginaActual = filtradas.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

  // Ventana de páginas con elipsis: 1 ... p-1 p p+1 ... N
  function rangoPaginas(actual, total) {
    const paginas = []
    const inicio = Math.max(1, actual - 2)
    const fin = Math.min(total, actual + 2)
    if (inicio > 1) paginas.push(1)
    if (inicio > 2) paginas.push('...')
    for (let p = inicio; p <= fin; p++) paginas.push(p)
    if (fin < total - 1) paginas.push('...')
    if (fin < total) paginas.push(total)
    return paginas
  }

  function irAPagina(p) {
    setPagina(p)
    window.scrollTo(0, 0) // al pasar de página, tirar hasta arriba
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Button
        variant="ghost"
        className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() => navigate('/menu')}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
        {t('volver')}
      </Button>

      <PageHero
        titulo={t('infoTitulo')}
        subtitulo={t('menuInfoDesc')}
      />

      {/* Buscador */}
      <div className="relative mt-4">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={busqueda}
          onChange={(e) => cambiarBusqueda(e.target.value)}
          placeholder={t('infoBuscarArticulo')}
          className="h-11 rounded-xl pl-9 pr-9"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => cambiarBusqueda('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-90"
            aria-label={t('limpiar')}
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filtro por tipo de multa (explicativo, no botón principal) */}
      <div className="mt-4">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('infoTipoMulta')}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {TIPOS_MULTA.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => cambiarTipoMulta(tipoMulta === c.id ? '' : c.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95',
                tipoMulta === c.id
                  ? c.color
                  : 'border-gray-200 bg-white text-muted-foreground hover:border-gray-300 dark:border-border dark:bg-card dark:hover:border-muted'
              )}
            >
              {t(c.clave)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista paginada */}
      <div className="mt-4 space-y-3">
        {paginaActual.map((i) => {
          const monto = i.monto ?? i.multa
          const descuento = i.descuento ?? (monto <= 1000 ? 0.25 : null)
          const conDescuento = descuento ? monto * (1 - descuento) : null
          const tipo = TIPOS_MULTA.find((c) => c.id === tipoMultaDe(i)) ?? TIPOS_MULTA[0]
          return (
            <div
              key={i.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 dark:border-border dark:bg-card"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                        tipo.color
                      )}
                    >
                      {t(tipo.clave)}
                    </span>
                  </div>
                  <p className="mt-1.5 font-semibold leading-snug">{i.nombre ?? i.id}</p>
                  {i.codigo && (
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                      {i.codigo}
                    </p>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {i.descripcion ?? ''}
                  </p>
                  {i.consejo && (
                    <p className="mt-2 flex items-start gap-2 rounded-xl bg-emerald-100/70 px-3 py-2 text-xs leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <FontAwesomeIcon icon={faLightbulb} className="mt-0.5 shrink-0" />
                      <span>{i.consejo}</span>
                    </p>
                  )}
                </div>
                <div className="shrink-0 sm:text-right">
                  {conDescuento ? (
                    <>
                      <p className="font-bold text-gray-900 dark:text-foreground">Q{conDescuento.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground line-through">Q{monto}</p>
                      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                        {t('infoDescuento')}
                      </span>
                    </>
                  ) : (
                    <p className="font-bold text-gray-900 dark:text-foreground">Q{monto}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {filtradas.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {infracciones.length === 0 ? <LoadingSpinner /> : t('infoBuscar')}
          </p>
        )}
      </div>

      {/* Paginación: << < x x x ... > >> sin texto */}
      {totalPaginas > 1 && (
        <div className="mt-5 flex items-center justify-center gap-1">
          <button
            type="button"
            disabled={pagina === 1}
            onClick={() => irAPagina(1)}
            aria-label={t('infoPrimera')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-muted-foreground transition hover:border-gray-300 hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-border dark:bg-card dark:hover:border-muted"
          >
            <FontAwesomeIcon icon={faAnglesLeft} className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={pagina === 1}
            onClick={() => irAPagina(pagina - 1)}
            aria-label={t('infoAnterior')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-muted-foreground transition hover:border-gray-300 hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-border dark:bg-card dark:hover:border-muted"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5" />
          </button>
          {rangoPaginas(pagina, totalPaginas).map((p, idx) =>
            p === '...' ? (
              <span key={`e${idx}`} className="px-1 text-xs text-muted-foreground">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => irAPagina(p)}
                aria-current={p === pagina ? 'page' : undefined}
                className={cn(
                  'h-9 w-9 rounded-lg text-sm font-semibold transition active:scale-95',
                  p === pagina
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-gray-200 bg-white text-muted-foreground hover:border-gray-300 hover:text-foreground dark:border-border dark:bg-card dark:hover:border-muted'
                )}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            disabled={pagina === totalPaginas}
            onClick={() => irAPagina(pagina + 1)}
            aria-label={t('infoSiguiente')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-muted-foreground transition hover:border-gray-300 hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-border dark:bg-card dark:hover:border-muted"
          >
            <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={pagina === totalPaginas}
            onClick={() => irAPagina(totalPaginas)}
            aria-label={t('infoUltima')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-muted-foreground transition hover:border-gray-300 hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:border-border dark:bg-card dark:hover:border-muted"
          >
            <FontAwesomeIcon icon={faAnglesRight} className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}