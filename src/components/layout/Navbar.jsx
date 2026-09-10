// Barra de navegación del módulo: logo MUGU + botón al menú de inicio.
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'

function LogoMugu({ className = 'h-10 w-10' }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="mugu-grad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="55%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="12" fill="url(#mugu-grad)" />
      <path
        d="M12 28 V13 l8 10 8-10 V28"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="9" r="2.4" fill="#fff" opacity="0.9" />
    </svg>
  )
}

export default function Navbar() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="flex items-center gap-2.5 rounded-xl transition hover:opacity-90 active:scale-95"
          aria-label="MUGU — Multas Guate"
        >
          <LogoMugu />
          <span className="text-left leading-none">
            <span className="block font-[family-name:var(--font-logo)] text-xl font-bold tracking-[0.18em] text-gray-900">
              MUGU
            </span>
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-fuchsia-600">
              {t('navMugu')}
            </span>
          </span>
        </button>

        <Button
          variant="ghost"
          size="sm"
          className="rounded-full border border-gray-200 text-sm font-semibold text-gray-700 transition hover:border-fuchsia-300 hover:bg-fuchsia-50 hover:text-fuchsia-700 active:scale-95"
          onClick={() => navigate('/menu')}
        >
          <span className="mr-1.5 inline-block" aria-hidden="true">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M10 2.5 2.8 9h2.2v8h4.2v-4h1.6v4H15V9h2.2L10 2.5Z" />
            </svg>
          </span>
          {t('navInicio')}
        </Button>
      </div>
    </header>
  )
}