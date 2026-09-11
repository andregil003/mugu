import React from "react";

interface GradientDotsProps {
  className?: string;
}

export const GradientDots: React.FC<GradientDotsProps> = ({ className = "" }) => {
  return (
    <div
      className={`absolute inset-0 -z-10 h-full w-full bg-background overflow-hidden ${className}`}
    >
      {/* Puntos decorativos estáticos (todos visibles) */}
      <div
        className="absolute inset-0 dark:opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(16, 185, 129, 0.35) 1.5px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Capa extra opcional para difuminar los bordes (Efecto viñeta) como en tu imagen */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,var(--background)_90%)] pointer-events-none" />
    </div>
  );
};