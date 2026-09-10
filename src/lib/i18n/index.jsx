// Contexto de i18n: expone t() + idioma actual.
// Los JSON se importan directo (Vite los empaqueta en el build).
import { createContext, useContext, useMemo, useState } from 'react'
import es from './es.json'
import kiche from './kiche.json'
import kawchiquel from './kawchiquel.json'

export const IDIOMAS = [
  { codigo: 'es', nombre: 'Español', diccionario: es },
  { codigo: 'kiche', nombre: "K'iche'", diccionario: kiche },
  { codigo: 'kawchiquel', nombre: 'Kawchiquel', diccionario: kawchiquel },
]

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [idioma, setIdioma] = useState('es')

  const value = useMemo(() => {
    const dict =
      IDIOMAS.find((i) => i.codigo === idioma)?.diccionario ?? es
    return {
      idioma,
      setIdioma,
      t: (clave) => dict[clave] ?? es[clave] ?? clave,
      idiomas: IDIOMAS,
    }
  }, [idioma])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n debe usarse dentro de <I18nProvider>')
  return ctx
}