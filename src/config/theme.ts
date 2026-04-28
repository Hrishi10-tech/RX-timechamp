/** Theme configuration: colors, breakpoints, and design tokens. */

export const THEME_COLORS = {
  light: {
    background: "hsl(0, 0%, 100%)",
    foreground: "hsl(222.2, 84%, 4.9%)",
    primary: "hsl(142.1, 76.2%, 36.3%)",
    primaryForeground: "hsl(355.7, 100%, 97.3%)",
    secondary: "hsl(210, 40%, 96.1%)",
    secondaryForeground: "hsl(222.2, 47.4%, 11.2%)",
    muted: "hsl(210, 40%, 96.1%)",
    mutedForeground: "hsl(215.4, 16.3%, 46.9%)",
    accent: "hsl(210, 40%, 96.1%)",
    accentForeground: "hsl(222.2, 47.4%, 11.2%)",
    destructive: "hsl(0, 84.2%, 60.2%)",
    destructiveForeground: "hsl(210, 40%, 98%)",
    border: "hsl(214.3, 31.8%, 91.4%)",
    ring: "hsl(142.1, 76.2%, 36.3%)",
    card: "hsl(0, 0%, 100%)",
    cardForeground: "hsl(222.2, 84%, 4.9%)",
  },
  dark: {
    background: "hsl(222.2, 84%, 4.9%)",
    foreground: "hsl(210, 40%, 98%)",
    primary: "hsl(142.1, 70.6%, 45.3%)",
    primaryForeground: "hsl(144.9, 80.4%, 10%)",
    secondary: "hsl(217.2, 32.6%, 17.5%)",
    secondaryForeground: "hsl(210, 40%, 98%)",
    muted: "hsl(217.2, 32.6%, 17.5%)",
    mutedForeground: "hsl(215, 20.2%, 65.1%)",
    accent: "hsl(217.2, 32.6%, 17.5%)",
    accentForeground: "hsl(210, 40%, 98%)",
    destructive: "hsl(0, 62.8%, 30.6%)",
    destructiveForeground: "hsl(210, 40%, 98%)",
    border: "hsl(217.2, 32.6%, 17.5%)",
    ring: "hsl(142.1, 70.6%, 45.3%)",
    card: "hsl(222.2, 84%, 4.9%)",
    cardForeground: "hsl(210, 40%, 98%)",
  },
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1400,
} as const;

export const SPACING = {
  sidebarWidth: 256,
  sidebarCollapsedWidth: 64,
  headerHeight: 64,
  contentPadding: 24,
  cardPadding: 16,
  gap: 16,
} as const;

export const TYPOGRAPHY = {
  fontFamily: {
    sans: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const SHADOWS = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
} as const;

export const TRANSITIONS = {
  fast: "150ms ease",
  normal: "200ms ease",
  slow: "300ms ease",
} as const;
