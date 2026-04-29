import { useEffect } from "react";

export type Theme = "dark";

export function useTheme() {
  // Permanently set to dark mode
  const theme: Theme = "dark";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    /* No-op: Dark mode is now permanent */
  };

  const setTheme = (t: Theme) => {
    /* No-op */
  };

  return { theme, toggleTheme, setTheme };
}
