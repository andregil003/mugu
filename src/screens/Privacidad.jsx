// pantalla_privacidad: política de privacidad de MUGU.
// Datos locales (localStorage), placa enviada al backend y no venta de datos.
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '@/lib/i18n'
import PageHero from '@/components/PageHero'

const SECCIONES = [
  { clave: 'privacidadS1Titulo', texto: 'privacidadS1Texto' },
  { clave: 'privacidadS2Titulo', texto: 'privacidadS2Texto' },
  { clave: 'privacidadS3Titulo', texto: 'privacidadS3Texto' },
  { clave: 'privacidadS4Titulo', texto: 'privacidadS4Texto' },
  { clave: 'privacidadS5Titulo', texto: 'privacidadS5Texto' },
  { clave: 'privacidadS6Titulo', texto: 'privacidadS6Texto' },
  { clave: 'privacidadS7Titulo', texto: 'privacidadS7Texto' },
]

export default function Privacidad() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Button
        variant="ghost"
        className="mb-4 -ml-1 text-muted-foreground transition hover:-translate-x-0.5 hover:text-foreground active:scale-95"
        onClick={() => navigate(-1)}
      >
        <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
        {t('volver')}
      </Button>

      <PageHero titulo={t('privacidadTitulo')} subtitulo={t('privacidadSubtitulo')} />

      <p className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-relaxed text-emerald-900 dark:border-emerald-950/50 dark:bg-emerald-950/30 dark:text-emerald-400">
        {t('privacidadIntro')}
      </p>

      <div className="mt-4 space-y-4">
        {SECCIONES.map((s) => (
          <section
            key={s.clave}
            className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-border dark:bg-card"
          >
            <h2 className="text-sm font-bold text-gray-900 dark:text-foreground">
              {t(s.clave)}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-foreground/80">
              {t(s.texto)}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}