// Router principal — arquitectura de flujo de rutas (ver arquitectura_de_flujo_de_multas.json)
// Entrada → Idioma → Bienvenida → Menú → [Flujo A: Buscar → Resultados → Detalle]
//                                      [Flujo B: FormFisica → Detalle]
//                                      [Flujo C: Info]
// Detalle → Apelacion | Pago
import { HashRouter, Route, Routes } from 'react-router-dom'
import { I18nProvider } from '@/lib/i18n'
import Entrada from '@/screens/Entrada'
import Idioma from '@/screens/Idioma'
import Bienvenida from '@/screens/Bienvenida'
import Menu from '@/screens/Menu'
import Buscar from '@/screens/Buscar'
import Resultados from '@/screens/Municipios'
import FormFisica from '@/screens/FormFisica'
import Info from '@/screens/Info'
import Detalle from '@/screens/Detalle'
import Apelacion from '@/screens/Apelacion'
import Pago from '@/screens/Pago'

function App() {
  return (
    <I18nProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Entrada />} />
          <Route path="/idioma" element={<Idioma />} />
          <Route path="/bienvenida" element={<Bienvenida />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/resultados" element={<Resultados />} />
          <Route path="/multa-fisica" element={<FormFisica />} />
          <Route path="/info" element={<Info />} />
          <Route path="/detalle" element={<Detalle />} />
          <Route path="/apelacion" element={<Apelacion />} />
          <Route path="/pago" element={<Pago />} />
        </Routes>
      </HashRouter>
    </I18nProvider>
  )
}

export default App