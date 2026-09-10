// Layout base del módulo: navbar arriba, contenido en el medio y footer abajo.
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function ModuleLayout({ children }) {
  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-b from-violet-50 via-white to-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}