/** Zustand alert store: alerts, unreadCount, add, markRead, clear. */

import { create } from "zustand";

import type { AlertSeverityLevel } from "@/types/api";

interface AlertItem {
  id: string;
  ruleId: string;
  userId: string;
  message: string;
  severity: AlertSeverityLevel;
  isRead: boolean;
  createdAt: string;
}

interface AlertState {
  alerts: AlertItem[];
  unreadCount: number;
  addAlert: (alert: AlertItem) => void;
  addAlerts: (alerts: AlertItem[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeAlert: (id: string) => void;
  clear: () => void;
}

function countUnread(alerts: AlertItem[]): number {
  return alerts.filter((alert) => !alert.isRead).length;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,

  addAlert: (alert: AlertItem): void => {
    set((state) => {
      const exists = state.alerts.some((a) => a.id === alert.id);
      if (exists) {
        return state;
      }
      const alerts = [alert, ...state.alerts];
      return { alerts, unreadCount: countUnread(alerts) };
    });
  },

  addAlerts: (newAlerts: AlertItem[]): void => {
    set((state) => {
      const existingIds = new Set(state.alerts.map((a) => a.id));
      const unique = newAlerts.filter((a) => !existingIds.has(a.id));
      const alerts = [...unique, ...state.alerts];
      return { alerts, unreadCount: countUnread(alerts) };
    });
  },

  markRead: (id: string): void => {
    set((state) => {
      const alerts = state.alerts.map((alert) =>
        alert.id === id ? { ...alert, isRead: true } : alert,
      );
      return { alerts, unreadCount: countUnread(alerts) };
    });
  },

  markAllRead: (): void => {
    set((state) => {
      const alerts = state.alerts.map((alert) => ({ ...alert, isRead: true }));
      return { alerts, unreadCount: 0 };
    });
  },

  removeAlert: (id: string): void => {
    set((state) => {
      const alerts = state.alerts.filter((alert) => alert.id !== id);
      return { alerts, unreadCount: countUnread(alerts) };
    });
  },

  clear: (): void => {
    set({ alerts: [], unreadCount: 0 });
  },
}));
