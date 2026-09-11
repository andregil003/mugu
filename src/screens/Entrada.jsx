// pantalla_entrada_qr: Punto de entrada (Web/QR) — enrutador inicial.
// Si ya eligió idioma antes → Bienvenida; si no → Selección de idioma.
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Entrada() {
  const navigate = useNavigate()

  useEffect(() => {
    const idioma =
      localStorage.getItem('mugu_idioma') ?? localStorage.getItem('multaclara_idioma')
    navigate(idioma ? '/bienvenida' : '/idioma', { replace: true })
  }, [navigate])

  return null
}