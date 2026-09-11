// pantalla_tamano: accesibilidad — elegir tamaño de texto (Normal/Grande/Extra).
// Aplica el escalado en toda la app y persiste la preferencia.
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTextHeight, faCheck } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { useTamano } from '@/lib/tamano'

const CLAVE_TAMANO = {
  normal: 'tamanoNormal',
  grande: 'tamanoGrande',
  extra: 'tamanoExtra',
}

const TAMANO_CLASE = {
  normal: 'text-base',
  grande: 'text-xl',
  extra: 'text-2xl',
}

export default function Tamano() {
  const { t } = useI18n()
  const { tamano, setTamano, tamanos } = useTamano()
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <div className="hero-gradient overflow-hidden rounded-3xl shadow-lg">
        <div className="px-6 py-7 text-white">
          <p className="text-xs font-medium uppercase tracking-widest text-white/70">
            {t('appNombre')}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{t('tamanoTitulo')}</h1>
          <p className="mt-1 text-sm text-white/80">{t('tamanoDesc')}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {tamanos.map((op) => {
          const activo = tamano === op.codigo
          return (
            <button
              key={op.codigo}
              type="button"
              onClick={() => setTamano(op.codigo)}
              className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 active:scale-[0.98] ${
                activo
                  ? 'border-violet-400 bg-violet-50 shadow-md ring-2 ring-violet-200'
                  : 'border-gray-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md'
              }`}
            >
              <span className="flex items-center gap-4">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                    activo ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faTextHeight} className="h-5 w-5" />
                </span>
                <span>
                  <span className={`block font-bold ${TAMANO_CLASE[op.codigo]}`}>
                    {t(CLAVE_TAMANO[op.codigo])}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {op.codigo === 'normal'
                      ? 'Aa'
                      : op.codigo === 'grande'
                        ? 'Aa Aa'
                        : 'Aa Aa Aa'}
                  </span>
                </span>
              </span>
              {activo && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white">
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      <Button
        variant="outline"
        className="mt-6 w-full rounded-xl py-5"
        onClick={() => navigate(-1)}
      >
        ← {t('volver')}
      </Button>
    </div>
  )
}