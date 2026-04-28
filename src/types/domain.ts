/** Business domain types for the TrackMe dashboard. */

export type UserRole = "admin" | "manager" | "viewer";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  orgId: string;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: string;
  userCount: number;
  createdAt: Date;
}

export type DeviceStatus = "online" | "offline" | "idle";
export type DevicePlatform = "windows" | "macos" | "linux";

export interface Device {
  id: string;
  userId: string;
  hostname: string;
  platform: DevicePlatform;
  osVersion: string;
  agentVersion: string;
  status: DeviceStatus;
  lastSeen: Date;
  registeredAt: Date;
}

export type SessionType = "active" | "idle" | "away" | "locked";

export interface ActivitySession {
  id: string;
  clientId: string;
  deviceId: string;
  userId: string;
  sessionType: SessionType;
  startTime: Date;
  endTime: Date | null;
  durationSec: number | null;
}

export interface AppUsage {
  id: string;
  processName: string;
  windowTitle: string;
  startTime: Date;
  endTime: Date | null;
  durationSec: number | null;
}

export interface UrlVisit {
  id: string;
  browser: string;
  url: string;
  domain: string;
  pageTitle: string;
  visitTime: Date;
  durationSec: number | null;
}

export interface Screenshot {
  id: string;
  userId: string;
  deviceId: string;
  capturedAt: Date;
  fileSize: number;
  downloadUrl: string;
}

export type AlertSeverity = "info" | "warning" | "critical";

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
  conditionType: string;
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  createdAt: Date;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ActivitySummary {
  period: string;
  totalActiveHours: number;
  totalIdleHours: number;
  activeRatio: number;
  sessionsCount: number;
}

export interface TopApp {
  name: string;
  totalHours: number;
  sessionCount: number;
}

export interface TopDomain {
  domain: string;
  totalHours: number;
  visitCount: number;
}

export interface TrendDataPoint {
  date: Date;
  activeHours: number;
  idleHours: number;
  productivityScore: number;
}
