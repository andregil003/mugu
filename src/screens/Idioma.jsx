// pantalla_idioma: Selección de idioma (es / k'iche' / kaqchikel) + sugerir.
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'

export default function Idioma() {
  const { t, idiomas, setIdioma } = useI18n()
  const navigate = useNavigate()

  function elegir(codigo) {
    setIdioma(codigo)
    localStorage.setItem('multaclara_idioma', codigo)
    navigate('/bienvenida')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t('seleccionaIdioma')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {idiomas.map((i) => (
            <Button
              key={i.codigo}
              variant="outline"
              className="w-full py-6 text-lg"
              onClick={() => elegir(i.codigo)}
            >
              {i.nombre}
            </Button>
          ))}
          <Button variant="ghost" className="w-full" onClick={() => alert('TODO: formulario de sugerencia de idioma')}>
            {t('sugerirIdioma')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}