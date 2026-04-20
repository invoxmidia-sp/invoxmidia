import { cn } from "@/lib/utils";

interface SoundWaveProps {
  className?: string;
  /** Number of vertical bars in the waveform */
  bars?: number;
  /** Peak amplitude factor (0-1) */
  amplitude?: number;
}

/**
 * Decorative animated waveform — pseudo-random heights, infinite drift.
 * Pure SVG, GPU-friendly (transform/opacity only).
 */
export function SoundWave({
  className,
  bars = 64,
  amplitude = 1,
}: SoundWaveProps) {
  // Deterministic pseudo-random heights so SSR matches CSR.
  const heights = Array.from({ length: bars }, (_, i) => {
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const r = seed - Math.floor(seed);
    return 0.25 + r * 0.75 * amplitude;
  });

  return (
    <svg
      className={cn("w-full h-16 text-invox-gold", className)}
      viewBox={`0 0 ${bars * 6} 100`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {heights.map((h, i) => {
        const barHeight = h * 80;
        const y = (100 - barHeight) / 2;
        const delay = (i % 8) * 0.12;
        return (
          <rect
            key={i}
            x={i * 6 + 1}
            y={y}
            width={3}
            height={barHeight}
            rx={1.5}
            fill="currentColor"
            opacity={0.55 + h * 0.4}
            style={{
              transformOrigin: "center",
              transformBox: "fill-box",
              animation: `eq-bounce ${1.6 + (i % 5) * 0.2}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}
    </svg>
  );
}
