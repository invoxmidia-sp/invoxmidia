import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
  /** Show the lead bar before the label */
  withBar?: boolean;
}

/** Editorial-style section label: monospace, uppercase, gold accent bar. */
export function SectionLabel({
  children,
  className,
  withBar = true,
}: SectionLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 mono-label text-secondary",
        className,
      )}
    >
      {withBar && (
        <span
          aria-hidden="true"
          className="block w-8 h-px bg-gradient-to-r from-transparent via-secondary to-secondary"
        />
      )}
      {children}
    </span>
  );
}
