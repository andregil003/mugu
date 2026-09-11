// InfoPopup: botón (?) que abre un popup con texto explicativo al hacer click.
// Funciona en móvil (click, no hover). Cierra al hacer click afuera o en el botón.
import { useState, useRef, useEffect } from 'react'

export default function InfoPopup({ texto, className }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function alClicAfuera(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', alClicAfuera)
    return () => document.removeEventListener('mousedown', alClicAfuera)
  }, [])

  return (
    <span ref={ref} className={`relative inline-flex align-middle ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="?"
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-300 text-[10px] font-bold leading-none text-emerald-600 transition hover:bg-emerald-50 active:scale-90 dark:border-emerald-500/50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
      >
        ?
      </button>
      {abierto && (
        <span className="absolute left-1/2 top-full z-50 mt-1.5 w-56 -translate-x-1/2 rounded-xl border border-emerald-200 bg-white p-3 text-xs leading-relaxed text-gray-700 shadow-lg dark:border-emerald-950/50 dark:bg-card dark:text-foreground/80">
          {texto}
        </span>
      )}
    </span>
  )
}