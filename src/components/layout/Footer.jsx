// Pie de página del módulo: espacios generales del sitio y centro de ayuda.
// Los datos de contacto se completan cuando la organización los defina.
import { Link } from 'react-router-dom'
import { useI18n } from '@/lib/i18n'

const ENLACES = [
  { clave: 'menuTitulo', ruta: '/menu' },
  { clave: 'menuBuscarMultas', ruta: '/buscar' },
  { clave: 'menuMultaFisica', ruta: '/multa-fisica' },
  { clave: 'menuNoEntiendo', ruta: '/info' },
]

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="mt-10 border-t border-gray-100 bg-white/70 backdrop-blur">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-[family-name:var(--font-logo)] text-lg font-bold tracking-[0.18em] text-gray-900">
            MUGU
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-fuchsia-600">
            {t('navMugu')}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t('footerLegal')}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t('footerGeneral')}
          </h3>
          <ul className="mt-3 space-y-2">
            {ENLACES.map((l) => (
              <li key={l.ruta}>
                <Link
                  to={l.ruta}
                  className="text-sm text-gray-700 transition hover:text-fuchsia-600 hover:underline"
                >
                  {t(l.clave)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {t('footerAyuda')}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>
              <span className="font-medium">{t('footerAyudaLinea')}:</span>{' '}
              <span className="text-muted-foreground">—</span>
            </li>
            <li>
              <span className="font-medium">{t('footerAyudaWhatsapp')}:</span>{' '}
              <span className="text-muted-foreground">—</span>
            </li>
            <li>
              <span className="font-medium">{t('footerAyudaCorreo')}:</span>{' '}
              <span className="text-muted-foreground">—</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            {t('footerAyudaPlaceholder')}
          </p>
        </div>
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MUGU · {t('tagline')}
      </div>
    </footer>
  )
}