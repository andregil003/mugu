// Contexto de accesibilidad: tamaño de texto (Normal / Grande / Extra grande).
// Aplica una clase al <html> (texto-grande / texto-extra) que escala el
// font-size base en toda la app (ver index.css). Persistido en localStorage.
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const TAMANOS = [
  { codigo: 'normal', clase: '' },
  { codigo: 'grande', clase: 'texto-grande' },
  { codigo: 'extra', clase: 'texto-extra' },
]

const CLAVE_TAMANO = 'mugu_tamano'

function leerTamanoGuardado() {
  try {
    const v = localStorage.getItem(CLAVE_TAMANO)
    return TAMANOS.some((t) => t.codigo === v) ? v : 'normal'
  } catch {
    return 'normal'
  }
}

const TamanoContext = createContext(null)

export function TamanoProvider({ children }) {
  const [tamano, setTamanoState] = useState(leerTamanoGuardado)

  const setTamano = (codigo) => {
    setTamanoState(codigo)
    try {
      localStorage.setItem(CLAVE_TAMANO, codigo)
    } catch {
      // localStorage bloqueado: solo en memoria
    }
  }

  // Aplica la clase al <html> para escalar toda la tipografía
  useEffect(() => {
    const html = document.documentElement
    TAMANOS.forEach((t) => {
      if (t.clase) html.classList.remove(t.clase)
    })
    const activo = TAMANOS.find((t) => t.codigo === tamano)
    if (activo?.clase) html.classList.add(activo.clase)
    return () => {
      TAMANOS.forEach((t) => {
        if (t.clase) html.classList.remove(t.clase)
      })
    }
  }, [tamano])

  const value = useMemo(
    () => ({ tamano, setTamano, tamanos: TAMANOS }),
    [tamano]
  )

  return (
    <TamanoContext.Provider value={value}>{children}</TamanoContext.Provider>
  )
}

export function useTamano() {
  const ctx = useContext(TamanoContext)
  if (!ctx) throw new Error('useTamano debe usarse dentro de <TamanoProvider>')
  return ctx
}