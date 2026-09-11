// Contexto de i18n: expone t() + idioma actual.
// Los JSON se importan directo (Vite los empaqueta en el build).
// El idioma se persiste en localStorage (mugu_idioma) para que sobreviva
// recargas y actualizaciones (bug: al presionar "Actualizar" volvía a español).
import { createContext, useContext, useMemo, useState } from 'react'
import es from './es.json'
import en from './en.json'
import kiche from './kiche.json'
import kawchiquel from './kawchiquel.json'

export const IDIOMAS = [
  {
    codigo: 'es',
    nombre: 'Español',
    bienvenida: 'Te ayudamos a entender y resolver tus multas de tránsito.',
    diccionario: es,
  },
  {
    codigo: 'en',
    nombre: 'English',
    bienvenida: 'We help you understand and resolve your traffic fines.',
    diccionario: en,
  },
  // TODO(Uriel): traducción real de la bienvenida (saludo real por ahora)
  { codigo: 'kiche', nombre: "K'iche'", bienvenida: 'Saqirik!', diccionario: kiche },
  { codigo: 'kawchiquel', nombre: 'Kaqchikel', bienvenida: 'Xsaqär', diccionario: kawchiquel },
]

const CLAVE_IDIOMA = 'mugu_idioma'
const CLAVE_VIEJA = 'multaclara_idioma'

function leerIdiomaGuardado() {
  try {
    return (
      localStorage.getItem(CLAVE_IDIOMA) ??
      localStorage.getItem(CLAVE_VIEJA) ??
      'es'
    )
  } catch {
    return 'es'
  }
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [idioma, setIdiomaState] = useState(leerIdiomaGuardado)

  const setIdioma = (codigo) => {
    setIdiomaState(codigo)
    try {
      localStorage.setItem(CLAVE_IDIOMA, codigo)
      localStorage.removeItem(CLAVE_VIEJA)
    } catch {
      // localStorage bloqueado: solo en memoria
    }
  }

  const value = useMemo(() => {
    const dict =
      IDIOMAS.find((i) => i.codigo === idioma)?.diccionario ?? es
    return {
      idioma,
      setIdioma,
      t: (clave, vars) => {
        let texto = dict[clave] ?? es[clave] ?? clave
        if (vars) {
          Object.entries(vars).forEach(([k, v]) => {
            texto = texto.replaceAll(`{${k}}`, v)
          })
        }
        return texto
      },
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