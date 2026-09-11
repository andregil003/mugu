// pantalla_tabla_informativa (Flujo C): "No entiendo mi multa".
// Buscador + filtro por categoría (leve/grave/muy grave) + montos con descuento.
import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n'
import { cargarInfracciones } from '@/lib/data'
import { cn } from '@/lib/utils'

const CATEGORIAS = [
  { id: 'leve', clave: 'catLeve', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  { id: 'grave', clave: 'catGrave', color: 'border-amber-300 bg-amber-50 text-amber-800' },
  { id: 'muy_grave', clave: 'catMuyGrave', color: 'border-red-300 bg-red-50 text-red-800' },
]

function categoriaDe(i) {
  if (i.categoria) return i.categoria
  const monto = i.monto ?? i.multa ?? 0
  if (monto <= 200) return 'leve'
  if (monto <= 500) return 'grave'
  return 'muy_grave'
}

export default function Info() {
  const { t } = useI18n()
  const [infracciones, setInfracciones] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')

  useEffect(() => {
    cargarInfracciones().then(setInfracciones).catch(() => {})
  }, [])

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return infracciones.filter((i) => {
      if (categoria && categoriaDe(i) !== categoria) return false
      if (!q) return true
      const texto = `${i.nombre ?? ''} ${i.descripcion ?? ''} ${i.id ?? ''} ${i.articulo ?? ''}`.toLowerCase()
      return texto.includes(q)
    })
  }, [infracciones, busqueda, categoria])

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card className="rounded-2xl shadow-sm transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('infoTitulo')}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Buscador */}
          <div className="relative mb-3">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={t('infoBuscar')}
              className="h-11 rounded-xl pl-9 pr-9"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground active:scale-90"
                aria-label={t('limpiar')}
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filtro por categoría */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCategoria('')}
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
                onClick={() => setCategoria(categoria === c.id ? '' : c.id)}
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
          </div>

          {/* Lista */}
          <div className="space-y-3">
            {filtradas.map((i) => {
              const monto = i.monto ?? i.multa
              const descuento = i.descuento ?? (monto <= 1000 ? 0.25 : null)
              const conDescuento = descuento ? monto * (1 - descuento) : null
              const cat = categoriaDe(i)
              const chip = CATEGORIAS.find((c) => c.id === cat)
              return (
                <div
                  key={i.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold leading-snug">{i.nombre ?? i.id}</p>
                    {chip && (
                      <span
                        className={cn(
                          'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          chip.color
                        )}
                      >
                        {t(chip.clave)}
                      </span>
                    )}
                  </div>
                  {i.articulo && (
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                      Art. {i.articulo}
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
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="font-bold text-gray-900">Q{monto}</span>
                    {conDescuento && (
                      <>
                        <span className="text-xs text-muted-foreground line-through">
                          Q{conDescuento.toFixed(2)}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          {t('infoDescuento')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
            {filtradas.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {infracciones.length === 0 ? 'Cargando…' : t('infoBuscar')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}