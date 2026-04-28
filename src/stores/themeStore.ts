/** Zustand theme store: mode (light/dark/system), toggle, setMode, persist to localStorage. */

import { create } from "zustand";

import { THEME_STORAGE_KEY } from "@/config/constants";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: getStoredTheme(),

  setMode: (mode: ThemeMode): void => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    set({ mode });
  },

  toggle: (): void => {
    const { mode, setMode } = get();
    const nextMode: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(nextMode);
  },
}));
