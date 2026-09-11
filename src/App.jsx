// Router principal — arquitectura de flujo de rutas (ver arquitectura_de_flujo_de_multas.json)
// Entrada → Idioma → Bienvenida → Menú → [Flujo A: Buscar → Resultados → Detalle]
//                                      [Flujo B: FormFisica → Detalle]
//                                      [Flujo C: Info]
// Detalle → Apelacion | Pago
import { useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { I18nProvider } from '@/lib/i18n'
import { TamanoProvider } from '@/lib/tamano'
import { useDarkMode } from '@/hooks/useDarkMode'
import AppShell from '@/components/AppShell'
import Entrada from '@/screens/Entrada'
import Idioma from '@/screens/Idioma'
import Tamano from '@/screens/Tamano'
import Bienvenida from '@/screens/Bienvenida'
import Menu from '@/screens/Menu'
import Buscar from '@/screens/Buscar'
import Resultados from '@/screens/Municipios'
import Multas from '@/screens/Multas'
import FormFisica from '@/screens/FormFisica'
import Info from '@/screens/Info'
import Detalle from '@/screens/Detalle'
import Apelacion from '@/screens/Apelacion'
import Pago from '@/screens/Pago'

// Scroll al tope en cada cambio de ruta (no dejar al usuario a media página)
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  useDarkMode()
  return (
    <I18nProvider>
      <TamanoProvider>
        <HashRouter>
          <ScrollToTop />
          <AppShell>
            <Routes>
              <Route path="/" element={<Entrada />} />
              <Route path="/idioma" element={<Idioma />} />
              <Route path="/tamano" element={<Tamano />} />
              <Route path="/bienvenida" element={<Bienvenida />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/buscar" element={<Buscar />} />
              <Route path="/resultados" element={<Resultados />} />
              <Route path="/multas" element={<Multas />} />
              <Route path="/multa-fisica" element={<FormFisica />} />
              <Route path="/info" element={<Info />} />
              <Route path="/detalle" element={<Detalle />} />
              <Route path="/apelacion" element={<Apelacion />} />
              <Route path="/pago" element={<Pago />} />
            </Routes>
          </AppShell>
        </HashRouter>
      </TamanoProvider>
    </I18nProvider>
  )
}

export default App