/** Shared constants used across utility modules. */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const DEBOUNCE_DELAY_MS = 300;
export const POLLING_INTERVAL_MS = 30000;
export const TOAST_DURATION_MS = 5000;
export const ANIMATION_DURATION_MS = 200;

export const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
} as const;

export const FILE_SIZE_LIMITS = {
  MAX_SCREENSHOT_BYTES: 10485760,
  MAX_REPORT_EXPORT_ROWS: 10000,
} as const;

export const LOCAL_STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: "trackme_sidebar_collapsed",
  TABLE_PAGE_SIZE: "trackme_table_page_size",
  RECENT_SEARCHES: "trackme_recent_searches",
} as const;

export const PRODUCTIVITY_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  AVERAGE: 40,
  BELOW_AVERAGE: 20,
} as const;

export const SESSION_TYPE_LABELS: Record<string, string> = {
  active: "Active",
  idle: "Idle",
  away: "Away",
  locked: "Locked",
};

export const SEVERITY_COLORS: Record<string, string> = {
  info: "text-blue-500",
  warning: "text-yellow-500",
  critical: "text-red-500",
};
