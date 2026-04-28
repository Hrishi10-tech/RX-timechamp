/** API response types matching all backend schemas. */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
  org_id: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

export interface SortParams {
  sort?: string;
  order?: "asc" | "desc";
}

export interface ErrorResponse {
  detail: string;
}

export interface ActivitySessionResponse {
  id: string;
  client_id: string;
  device_id: string;
  user_id: string;
  session_type: string;
  start_time: string;
  end_time: string | null;
  duration_sec: number | null;
}

export interface ActivitySummaryResponse {
  period: string;
  total_active_hours: number;
  total_idle_hours: number;
  active_ratio: number;
  sessions_count: number;
}

export interface AppUsageResponse {
  id: string;
  process_name: string;
  window_title: string;
  start_time: string;
  end_time: string | null;
  duration_sec: number | null;
}

export interface TopAppsResponse {
  name: string;
  total_hours: number;
  session_count: number;
}

export interface UrlVisitResponse {
  id: string;
  browser: string;
  url: string;
  domain: string;
  page_title: string;
  visit_time: string;
  duration_sec: number | null;
}

export interface TopDomainsResponse {
  domain: string;
  total_hours: number;
  visit_count: number;
}

export interface ScreenshotResponse {
  id: string;
  user_id: string;
  device_id: string;
  captured_at: string;
  file_size: number;
  download_url: string;
}

export interface ScreenshotGalleryResponse {
  screenshots: ScreenshotResponse[];
  total: number;
  has_more: boolean;
}

export interface DashboardOverviewResponse {
  period: string;
  total_users: number;
  active_today: number;
  avg_active_hours: number;
  avg_idle_ratio: number;
  top_apps: TopAppsResponse[];
  top_domains: TopDomainsResponse[];
}

export interface UserDashboardResponse {
  user_id: string;
  full_name: string;
  total_active_hours: number;
  total_idle_hours: number;
  top_apps: TopAppsResponse[];
  top_domains: TopDomainsResponse[];
  productivity_score: number;
}

export interface TrendsResponse {
  dates: string[];
  active_hours: number[];
  idle_hours: number[];
  productivity_scores: number[];
}

export interface ReportRequest {
  report_type: ReportType;
  start_date: string;
  end_date: string;
  user_ids?: string[];
  format: ReportFormat;
}

export type ReportType = "activity" | "productivity" | "app_usage" | "url_visits";
export type ReportFormat = "pdf" | "csv" | "xlsx";
export type ReportStatus = "pending" | "generating" | "completed" | "failed";

export interface ReportResponse {
  id: string;
  report_type: ReportType;
  status: ReportStatus;
  created_at: string;
  completed_at: string | null;
  download_url: string | null;
  format: ReportFormat;
}

export interface ReportScheduleRequest {
  report_type: ReportType;
  format: ReportFormat;
  cron_expression: string;
  recipients: string[];
}

export interface AlertRuleRequest {
  name: string;
  condition_type: string;
  threshold: number;
  severity: AlertSeverityLevel;
  enabled: boolean;
}

export type AlertSeverityLevel = "info" | "warning" | "critical";

export interface AlertResponse {
  id: string;
  rule_id: string;
  user_id: string;
  message: string;
  severity: AlertSeverityLevel;
  is_read: boolean;
  created_at: string;
}

export interface AlertRuleResponse {
  id: string;
  name: string;
  condition_type: string;
  threshold: number;
  severity: AlertSeverityLevel;
  enabled: boolean;
  created_at: string;
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: unknown;
  timestamp: string;
}

export type WebSocketMessageType =
  | "agent_status"
  | "activity_update"
  | "alert"
  | "screenshot_captured"
  | "heartbeat";

export interface AgentStatusPayload {
  device_id: string;
  user_id: string;
  status: "online" | "offline" | "idle";
  last_seen: string;
}

export interface ActivityUpdatePayload {
  device_id: string;
  user_id: string;
  session_type: string;
  timestamp: string;
}

export interface AlertPayload {
  alert_id: string;
  message: string;
  severity: AlertSeverityLevel;
  user_id: string;
}

export interface ScreenshotCapturedPayload {
  screenshot_id: string;
  device_id: string;
  user_id: string;
  captured_at: string;
}
