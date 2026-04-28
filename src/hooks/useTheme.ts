/** Dark mode hook wrapping themeStore with system preference detection. */

import { useEffect, useMemo } from "react";

import { type ThemeMode, useThemeStore } from "@/stores/themeStore";

export interface UseThemeReturn {
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  isDark: boolean;
}

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme(): UseThemeReturn {
  const { mode, setMode, toggle } = useThemeStore();

  const resolvedMode = useMemo((): "light" | "dark" => {
    if (mode === "system") {
      return getSystemPreference();
    }
    return mode;
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedMode]);

  useEffect(() => {
    if (mode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (): void => {
      const root = document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [mode]);

  return {
    mode,
    resolvedMode,
    setMode,
    toggle,
    isDark: resolvedMode === "dark",
  };
}
