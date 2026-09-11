import React from "react";

interface GradientDotsProps {
  duration?: number;
  className?: string;
}

export const GradientDots: React.FC<GradientDotsProps> = ({
  duration = 7,
  className = "",
}) => {
  return (
    <div
      className={`absolute inset-0 -z-10 h-full w-full bg-background overflow-hidden ${className}`}
    >
      <style>
        {`
          @keyframes onda-subir {
            0% { transform: translateY(110%); }
            100% { transform: translateY(-250%); }
          }
          @media (prefers-reduced-motion: reduce) {
            .gradient-dots-onda { animation: none !important; transform: translateY(0); }
          }
        `}
      </style>

      {/* Capa base: TODOS los puntos visibles (tenues) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(16, 185, 129, 0.35) 1.5px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Onda de luz que sube de abajo hacia arriba e ilumina los puntos a su paso */}
      <div
        className="gradient-dots-onda absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          backgroundImage:
            "linear-gradient(to top, transparent 0%, rgba(74, 222, 128, 0.85) 50%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
          WebkitMaskSize: "22px 22px",
          maskImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
          maskSize: "22px 22px",
          animation: `onda-subir ${duration}s linear infinite`,
        }}
      />

      {/* Capa extra opcional para difuminar los bordes (Efecto viñeta) como en tu imagen */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,var(--background)_90%)] pointer-events-none" />
    </div>
  );
};