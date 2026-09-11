import { useEffect, useState, useCallback } from 'react'

const LS_KEY = 'darkMode'

function getInitialDark() {
  const stored = localStorage.getItem(LS_KEY)
  if (stored === 'true') return true
  if (stored === 'false') return false
  // Decisión de André: la app SIEMPRE arranca en light mode
  // (no sigue prefers-color-scheme del sistema)
  return false
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitialDark)

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(LS_KEY, String(isDark))
  }, [isDark])

  const toggle = useCallback(() => setIsDark((v) => !v), [])

  return { isDark, toggle }
}
