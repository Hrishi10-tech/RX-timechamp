/** Alert-specific types for the monitoring subsystem. */

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertConditionType = "idle_time" | "app_usage" | "url_blocked" | "offline_duration";

export interface Alert {
  id: string;
  ruleId: string;
  userId: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  createdAt: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  conditionType: AlertConditionType;
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  createdAt: Date;
}

export interface AlertFilter {
  severity?: AlertSeverity;
  isRead?: boolean;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AlertStats {
  total: number;
  unread: number;
  bySeverity: Record<AlertSeverity, number>;
}

export interface AlertNotification {
  alertId: string;
  message: string;
  severity: AlertSeverity;
  userId: string;
  timestamp: Date;
}
