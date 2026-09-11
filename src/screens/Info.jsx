// pantalla_tabla_informativa (Flujo C): "No entiendo mi multa".
// Buscador + filtro por categoría (leve/grave/muy grave) + filtro por tipo de multa
// (papeleta/cepo/fotovelocímetro) + paginación de 10 + montos con descuento.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLightbulb,
  faMagnifyingGlass,
  faXmark,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageHero from '@/components/PageHero'
import { useI18n } from '@/lib/i18n'
import { cargarInfracciones } from '@/lib/data'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 10

const CATEGORIAS = [
  { id: 'leve', clave: 'catLeve', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  { id: 'grave', clave: 'catGrave', color: 'border-amber-300 bg-amber-50 text-amber-800' },
  { id: 'muy_grave', clave: 'catMuyGrave', color: 'border-red-300 bg-red-50 text-red-800' },
]

const TIPOS_MULTA = [
  { id: 'papeleta', clave: 'infoTipoPapeleta', color: 'border-amber-300 bg-amber-50 text-amber-800' },
  { id: 'cepo', clave: 'infoTipoCepo', color: 'border-gray-300 bg-gray-100 text-gray-700' },
  { id: 'fotovelocimetro', clave: 'infoTipoFotovelocimetro', color: 'border-sky-300 bg-sky-50 text-sky-800' },
]

function categoriaDe(i) {
  if (i.categoria) return i.categoria
  const monto = i.monto ?? i.multa ?? 0
  if (monto <= 200) return 'leve'
  if (monto <= 500) return 'grave'
  return 'muy_grave'
}

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
  const [categoria, setCategoria] = useState('')
  const [tipoMulta, setTipoMulta] = useState('')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    cargarInfracciones().then(setInfracciones).catch(() => {})
  }, [])

  function cambiarBusqueda(v) {
    setBusqueda(v)
    setPagina(1)
  }

  function cambiarCategoria(v) {
    setCategoria(v)
    setPagina(1)
  }

  function cambiarTipoMulta(v) {
    setTipoMulta(v)
    setPagina(1)
  }

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return infracciones.filter((i) => {
      if (categoria && categoriaDe(i) !== categoria) return false
      if (tipoMulta && tipoMultaDe(i) !== tipoMulta) return false
      if (!q) return true
      const texto = `${i.nombre ?? ''} ${i.descripcion ?? ''} ${i.id ?? ''} ${i.codigo ?? ''} ${i.articulo ?? ''}`.toLowerCase()
      return texto.includes(q)
    })
  }, [infracciones, busqueda, categoria, tipoMulta])

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE))
  const paginaActual = filtradas.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE)

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
        eyebrow={t('appNombre')}
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

      {/* Filtros: categoría + tipo de multa */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => cambiarCategoria('')}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95',
            !categoria
              ? 'border-emerald-400 bg-emerald-600 text-white shadow-sm'
              : 'border-gray-200 bg-white text-muted-foreground hover:border-emerald-300'
          )}
        >
          {t('infoCategoria')}
        </button>
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => cambiarCategoria(categoria === c.id ? '' : c.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95',
              categoria === c.id
                ? c.color
                : 'border-gray-200 bg-white text-muted-foreground hover:border-gray-300'
            )}
          >
            {t(c.clave)}
          </button>
        ))}

        <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

        <button
          type="button"
          onClick={() => cambiarTipoMulta('')}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95',
            !tipoMulta
              ? 'border-emerald-400 bg-emerald-600 text-white shadow-sm'
              : 'border-gray-200 bg-white text-muted-foreground hover:border-emerald-300'
          )}
        >
          {t('infoTipoMulta')}
        </button>
        {TIPOS_MULTA.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => cambiarTipoMulta(tipoMulta === c.id ? '' : c.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95',
              tipoMulta === c.id
                ? c.color
                : 'border-gray-200 bg-white text-muted-foreground hover:border-gray-300'
            )}
          >
            {t(c.clave)}
          </button>
        ))}
      </div>

      {/* Lista paginada */}
      <div className="mt-4 space-y-3">
        {paginaActual.map((i) => {
          const monto = i.monto ?? i.multa
          const descuento = i.descuento ?? (monto <= 1000 ? 0.25 : null)
          const conDescuento = descuento ? monto * (1 - descuento) : null
          const cat = categoriaDe(i)
          const chip = CATEGORIAS.find((c) => c.id === cat)
          const tipo = TIPOS_MULTA.find((c) => c.id === tipoMultaDe(i)) ?? TIPOS_MULTA[0]
          return (
            <div
              key={i.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
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
                    {chip && (
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          chip.color
                        )}
                      >
                        {t(chip.clave)}
                      </span>
                    )}
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
                    <p className="mt-2 flex items-start gap-2 rounded-xl bg-emerald-100/70 px-3 py-2 text-xs leading-relaxed text-emerald-900">
                      <FontAwesomeIcon icon={faLightbulb} className="mt-0.5 shrink-0" />
                      <span>{i.consejo}</span>
                    </p>
                  )}
                </div>
                <div className="shrink-0 sm:text-right">
                  {conDescuento ? (
                    <>
                      <p className="font-bold text-gray-900">Q{conDescuento.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground line-through">Q{monto}</p>
                      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {t('infoDescuento')}
                      </span>
                    </>
                  ) : (
                    <p className="font-bold text-gray-900">Q{monto}</p>
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

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={pagina === 1}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5" />
            {t('infoAnterior')}
          </Button>
          <span className="text-xs font-medium text-muted-foreground">
            {t('infoPagina')} {pagina} {t('infoDe')} {totalPaginas}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          >
            {t('infoSiguiente')}
            <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}