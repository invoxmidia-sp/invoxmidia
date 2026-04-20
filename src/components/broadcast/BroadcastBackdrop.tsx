import { cn } from "@/lib/utils";

interface BroadcastBackdropProps {
  className?: string;
  /** Show the vinyl-ring concentric texture */
  rings?: boolean;
  /** Show the noise/grain overlay */
  grain?: boolean;
}

/**
 * Decorative dark-broadcast backdrop:
 *  - Mesh gradient (navy → navy-deep with gold pools of light)
 *  - Optional vinyl rings (concentric)
 *  - Optional film grain
 *  - Floating ambient orbs
 *
 * Position: absolute, inset-0, pointer-events-none. Drop into any `relative` parent.
 */
export function BroadcastBackdrop({
  className,
  rings = true,
  grain = true,
}: BroadcastBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none broadcast-gradient",
        className,
      )}
    >
      {rings && (
        <div className="absolute -top-1/3 -right-1/4 w-[120%] h-[180%] vinyl-rings opacity-40" />
      )}

      {/* Floating ambient orbs */}
      <div className="absolute top-[15%] left-[8%] w-72 h-72 rounded-full bg-secondary/15 blur-3xl animate-float" />
      <div
        className="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-full bg-invox-orange/10 blur-3xl animate-float"
        style={{ animationDelay: "-3s" }}
      />
      <div className="absolute top-[40%] left-[45%] w-64 h-64 rounded-full bg-invox-navy-light/30 blur-3xl" />

      {/* Subtle scanline-style horizontal lines (very low opacity) */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, hsl(var(--invox-cream)) 0px, hsl(var(--invox-cream)) 1px, transparent 1px, transparent 4px)",
        }}
      />

      {/* Film grain */}
      {grain && (
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
            backgroundSize: "180px 180px",
          }}
        />
      )}
    </div>
  );
}
