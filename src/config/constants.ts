/** Application-wide constants: routes, API endpoints, roles, and configuration. */

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD_OVERVIEW: "/dashboard/overview",
  TEAM_DASHBOARD: "/team/:teamId/dashboard",
  USER_DETAIL: "/user/:userId/detail",
  MONITORING_SCREENSHOTS: "/monitoring/screenshots",
  MONITORING_ALERTS: "/monitoring/alerts",
  MONITORING_DEVICES: "/monitoring/devices",
  REPORTING_REPORTS: "/reporting/reports",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  ACTIVITY: {
    SESSIONS: "/activity/sessions",
    SUMMARY: "/activity/summary",
  },
  APPS: {
    USAGE: "/apps/usage",
    TOP: "/apps/top",
  },
  URLS: {
    VISITS: "/urls/visits",
    TOP_DOMAINS: "/urls/top-domains",
  },
  SCREENSHOTS: {
    LIST: "/screenshots",
    DETAIL: (id: string) => `/screenshots/${id}`,
    DELETE: (id: string) => `/screenshots/${id}`,
  },
  DASHBOARD: {
    OVERVIEW: "/dashboard/overview",
    USER: (userId: string) => `/dashboard/user/${userId}`,
    TRENDS: "/dashboard/trends",
  },
  REPORTS: {
    GENERATE: "/reports/generate",
    LIST: "/reports",
    DETAIL: (id: string) => `/reports/${id}`,
    SCHEDULE: "/reports/schedule",
  },
  ALERTS: {
    LIST: "/admin/alerts",
    UPDATE: (id: string) => `/admin/alerts/${id}`,
    RULES: "/admin/alerts/rules",
    CREATE_RULE: "/admin/alerts/rules",
  },
} as const;

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  VIEWER: "viewer",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 25,
  MAX_PER_PAGE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

export const WEBSOCKET = {
  RECONNECT_BASE_DELAY_MS: 1000,
  RECONNECT_MAX_DELAY_MS: 30000,
  RECONNECT_MULTIPLIER: 2,
  HEARTBEAT_INTERVAL_MS: 30000,
  MAX_RECONNECT_ATTEMPTS: 10,
} as const;

export const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: "trackme_access_token",
  REFRESH_TOKEN: "trackme_refresh_token",
} as const;

export const THEME_STORAGE_KEY = "trackme_theme" as const;

export const DATE_FORMATS = {
  DISPLAY_DATE: "MMM d, yyyy",
  DISPLAY_DATE_TIME: "MMM d, yyyy h:mm a",
  DISPLAY_TIME: "h:mm a",
  API_DATE: "yyyy-MM-dd",
  API_DATE_TIME: "yyyy-MM-dd'T'HH:mm:ss",
  CHART_DATE: "MMM d",
  SHORT_DATE: "MM/dd",
} as const;

export const CHART_COLORS = {
  ACTIVE: "hsl(142.1, 76.2%, 36.3%)",
  IDLE: "hsl(38, 92%, 50%)",
  PRODUCTIVE: "hsl(142.1, 70.6%, 45.3%)",
  UNPRODUCTIVE: "hsl(0, 84.2%, 60.2%)",
  NEUTRAL: "hsl(215.4, 16.3%, 46.9%)",
} as const;

export const KEYBOARD_SHORTCUTS = {
  SEARCH: "ctrl+k",
  TOGGLE_THEME: "ctrl+shift+d",
  NAVIGATE_OVERVIEW: "ctrl+1",
  NAVIGATE_SCREENSHOTS: "ctrl+2",
  NAVIGATE_ALERTS: "ctrl+3",
  NAVIGATE_REPORTS: "ctrl+4",
  EXPORT: "ctrl+e",
} as const;

export const SCREENSHOT_GALLERY = {
  ITEMS_PER_PAGE: 20,
  THUMBNAIL_WIDTH: 320,
  THUMBNAIL_HEIGHT: 180,
} as const;

export const ALERT_SEVERITY_ORDER = {
  critical: 0,
  warning: 1,
  info: 2,
} as const;

export const SESSION_TYPES = {
  ACTIVE: "active",
  IDLE: "idle",
  AWAY: "away",
  LOCKED: "locked",
} as const;

export const REFRESH_TOKEN_BUFFER_MS = 60000;
