// PageHero: encabezado de página con gradiente verde institucional.
// Reutilizable en Buscar, Municipios, FormFisica, Detalle, etc.
export default function PageHero({ eyebrow, titulo, subtitulo, children }) {
  return (
    <div className="hero-gradient overflow-hidden rounded-2xl shadow-lg">
      <div className="px-5 py-6 text-white">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-widest text-green-100">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-green-100">{subtitulo}</p>}
        {children}
      </div>
    </div>
  )
}