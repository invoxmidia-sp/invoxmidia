import { Moon, Sun } from "lucide-react";
import { useThemeContext } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

interface DarkModeToggleProps {
  className?: string;
}

export function DarkModeToggle({ className }: DarkModeToggleProps) {
  const { theme, toggleTheme } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <button
      id="dark-mode-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo Claro" : "Modo Escuro"}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-xl",
        "transition-all duration-500 ease-out",
        "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isDark
          ? [
              // Dark mode button style — solid sky blue
              "bg-[#111315] border-[#3FB9FE]/30 text-[#3FB9FE]",
              "shadow-md hover:border-[#3FB9FE]/70 hover:shadow-lg",
              "focus-visible:ring-[#3FB9FE]/50",
            ]
          : [
              // Light mode button style — gold glow
              "bg-white/80 border-amber-200/60 text-amber-500",
              "shadow-[0_2px_8px_rgba(245,158,11,0.15),inset_0_1px_0_rgba(255,255,255,0.9)]",
              "hover:border-amber-300 hover:shadow-[0_4px_16px_rgba(245,158,11,0.3)]",
              "focus-visible:ring-amber-400/50",
            ],
        className,
      )}
    >
      {/* Icon with animated swap */}
      <span
        className={cn(
          "relative z-10 transition-all duration-500",
          !isDark ? "rotate-0 scale-100" : "rotate-90 scale-90 opacity-0 absolute",
        )}
      >
        <Moon className="w-4 h-4 stroke-[1.8]" />
      </span>
      <span
        className={cn(
          "relative z-10 transition-all duration-500",
          isDark ? "rotate-0 scale-100" : "rotate-90 scale-90 opacity-0 absolute",
        )}
      >
        <Sun className="w-4 h-4 stroke-[1.8]" />
      </span>
    </button>
  );
}
