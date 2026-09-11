// FondoAnimado: capa decorativa de fondo — iconos de tránsito flotando
// en verde con degradado sutil (para que la página no se vea tan blanca).
// No interactúa (pointer-events-none), es aria-hidden y respeta
// prefers-reduced-motion (las animaciones se apagan).
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBus,
  faCar,
  faCarSide,
  faGaugeHigh,
  faLocationDot,
  faMotorcycle,
  faRoad,
  faShieldHalved,
  faTrafficLight,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'

const ICONOS = [
  { icono: faMotorcycle, top: '10%', left: '6%', size: 'h-12 w-12', dur: '15s', delay: '0s', opacidad: 0.9 },
  { icono: faTrafficLight, top: '22%', left: '88%', size: 'h-10 w-10', dur: '18s', delay: '1.2s', opacidad: 0.7 },
  { icono: faCar, top: '38%', left: '4%', size: 'h-9 w-9', dur: '20s', delay: '2.5s', opacidad: 0.6 },
  { icono: faTriangleExclamation, top: '52%', left: '92%', size: 'h-11 w-11', dur: '16s', delay: '0.8s', opacidad: 0.8 },
  { icono: faShieldHalved, top: '66%', left: '7%', size: 'h-10 w-10', dur: '19s', delay: '3s', opacidad: 0.65 },
  { icono: faGaugeHigh, top: '80%', left: '90%', size: 'h-9 w-9', dur: '17s', delay: '1.8s', opacidad: 0.7 },
  { icono: faRoad, top: '6%', left: '45%', size: 'h-8 w-8', dur: '22s', delay: '4s', opacidad: 0.5, deriva: true },
  { icono: faCarSide, top: '88%', left: '40%', size: 'h-10 w-10', dur: '21s', delay: '2s', opacidad: 0.6, deriva: true },
  { icono: faBus, top: '30%', left: '48%', size: 'h-8 w-8', dur: '24s', delay: '5s', opacidad: 0.45, deriva: true },
  { icono: faLocationDot, top: '72%', left: '48%', size: 'h-9 w-9', dur: '18s', delay: '3.6s', opacidad: 0.55 },
]

export default function FondoAnimado() {
  return (
    <div
      aria-hidden="true"
      className="fondo-degradado pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {ICONOS.map((i, idx) => (
        <FontAwesomeIcon
          key={idx}
          icon={i.icono}
          className={`icono-flotante absolute ${i.size} ${i.deriva ? 'icono-deriva' : ''}`}
          style={{
            top: i.top,
            left: i.left,
            opacity: i.opacidad,
            animationDuration: i.dur,
            animationDelay: i.delay,
          }}
        />
      ))}
    </div>
  )
}