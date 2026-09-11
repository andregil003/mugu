// LoadingSpinner: estado de carga consistente en toda la app.
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from '@/lib/i18n'

export default function LoadingSpinner({ texto }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
      <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4 text-emerald-600" />
      <span>{texto ?? t('cargando')}</span>
    </div>
  )
}