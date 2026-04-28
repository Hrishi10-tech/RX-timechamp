/** Keyboard navigation hook for global shortcuts. */

import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { KEYBOARD_SHORTCUTS, ROUTES } from "@/config/constants";
import { useThemeStore } from "@/stores/themeStore";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  handler: () => void;
}

function parseShortcut(
  shortcutStr: string,
  handler: () => void,
): ShortcutConfig {
  const parts = shortcutStr.split("+");
  const key = parts[parts.length - 1] ?? "";
  return {
    key: key.toLowerCase(),
    ctrl: parts.includes("ctrl"),
    shift: parts.includes("shift"),
    handler,
  };
}

export function useKeyboardShortcuts(): void {
  const navigate = useNavigate();
  const toggleTheme = useThemeStore((state) => state.toggle);

  const handleSearch = useCallback(() => {
    const searchInput = document.querySelector<HTMLInputElement>(
      '[data-shortcut="search"]',
    );
    searchInput?.focus();
  }, []);

  useEffect(() => {
    const shortcuts: ShortcutConfig[] = [
      parseShortcut(KEYBOARD_SHORTCUTS.SEARCH, handleSearch),
      parseShortcut(KEYBOARD_SHORTCUTS.TOGGLE_THEME, toggleTheme),
      parseShortcut(KEYBOARD_SHORTCUTS.NAVIGATE_OVERVIEW, () => {
        navigate(ROUTES.DASHBOARD_OVERVIEW);
      }),
      parseShortcut(KEYBOARD_SHORTCUTS.NAVIGATE_SCREENSHOTS, () => {
        navigate(ROUTES.MONITORING_SCREENSHOTS);
      }),
      parseShortcut(KEYBOARD_SHORTCUTS.NAVIGATE_ALERTS, () => {
        navigate(ROUTES.MONITORING_ALERTS);
      }),
      parseShortcut(KEYBOARD_SHORTCUTS.NAVIGATE_REPORTS, () => {
        navigate(ROUTES.REPORTING_REPORTS);
      }),
    ];

    function handleKeyDown(event: KeyboardEvent): void {
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key;

        if (ctrlMatch && shiftMatch && keyMatch) {
          if (isInputFocused && !shortcut.ctrl) {
            continue;
          }
          event.preventDefault();
          shortcut.handler();
          return;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate, toggleTheme, handleSearch]);
}
