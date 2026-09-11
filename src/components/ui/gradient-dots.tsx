import React from "react";

interface GradientDotsProps {
  duration?: number;
  className?: string;
}

export const GradientDots: React.FC<GradientDotsProps> = ({
  duration = 20,
  className = "",
}) => {
  return (
    <div
      className={`absolute inset-0 -z-10 h-full w-full bg-background overflow-hidden ${className}`}
    >
      <style>
        {`
          @keyframes rotate-gradient {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}
      </style>

      {/* Contenedor del gradiente animado */}
      <div
        className="absolute left-1/2 top-1/2 h-[200vw] w-[200vw] md:h-[150vw] md:w-[150vw]"
        style={{
          animation: `rotate-gradient ${duration}s linear infinite`,
          /* Gradiente basado en la paleta verde institucional (MultaClara) */
          backgroundImage:
            "conic-gradient(from 0deg, transparent 15%, #4ade80 30%, transparent 45%, transparent 65%, #34d399 80%, transparent 95%)",
          /* Máscara de puntos que revela el gradiente de atrás */
          WebkitMaskImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
          WebkitMaskSize: "22px 22px",
          maskImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
          maskSize: "22px 22px",
        }}
      />

      {/* Capa extra opcional para difuminar los bordes (Efecto viñeta) como en tu imagen */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,var(--background)_90%)] pointer-events-none" />
    </div>
  );
};