// Selector de idioma (ES/K'iche'/Kawchiquel) + tamaño de letra.
import { useI18n } from '@/lib/i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TAMANOS = [
  { valor: 'normal', escala: '100%' },
  { valor: 'grande', escala: '115%' },
  { valor: 'muy-grande', escala: '130%' },
]

export function IdiomaSelector({ tamano, setTamano }) {
  const { idioma, setIdioma, idiomas, t } = useI18n()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={idioma} onValueChange={setIdioma}>
        <SelectTrigger className="w-44" aria-label={t('labelIdioma')}>
          <SelectValue placeholder={t('labelIdioma')} />
        </SelectTrigger>
        <SelectContent>
          {idiomas.map((i) => (
            <SelectItem key={i.codigo} value={i.codigo}>
              {i.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={tamano}
        onValueChange={(v) => setTamano(v)}
      >
        <SelectTrigger className="w-44" aria-label={t('labelTamanoLetra')}>
          <SelectValue placeholder={t('labelTamanoLetra')} />
        </SelectTrigger>
        <SelectContent>
          {TAMANOS.map((tam) => (
            <SelectItem key={tam.valor} value={tam.valor}>
              {t('labelTamanoLetra')} {tam.escala}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}