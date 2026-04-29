import { useState, useEffect } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "invox-theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Read from localStorage first
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "dark" || stored === "light") return stored;
    // Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () =>
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  const setTheme = (t: Theme) => setThemeState(t);

  return { theme, toggleTheme, setTheme };
}
