import { cn } from "@/lib/utils";

interface EqualizerProps {
  className?: string;
  bars?: number;
  /** When false, bars freeze at random heights (paused state) */
  active?: boolean;
}

/** Animated audio-equalizer made of CSS bars. Inherits `currentColor`. */
export function Equalizer({ className, bars = 5, active = true }: EqualizerProps) {
  return (
    <span
      className={cn("equalizer", !active && "[&>span]:animate-none", className)}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span key={i} />
      ))}
    </span>
  );
}
