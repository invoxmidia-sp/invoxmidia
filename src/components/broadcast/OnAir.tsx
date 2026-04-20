import { cn } from "@/lib/utils";

interface OnAirProps {
  className?: string;
  label?: string;
}

/** Pulsing red dot + ON AIR label, broadcast-studio style. */
export function OnAir({ className, label = "On Air" }: OnAirProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 mono-label text-invox-cream/90",
        className,
      )}
    >
      <span className="on-air-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
