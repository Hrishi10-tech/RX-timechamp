/** Date formatting utilities using date-fns. */

import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
  subWeeks,
  subMonths,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from "date-fns";

import { DATE_FORMATS } from "@/config/constants";

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, DATE_FORMATS.DISPLAY_DATE);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, DATE_FORMATS.DISPLAY_DATE_TIME);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, DATE_FORMATS.DISPLAY_TIME);
}

export function formatApiDate(date: Date): string {
  return format(date, DATE_FORMATS.API_DATE);
}

export function formatChartDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, DATE_FORMATS.CHART_DATE);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;

  if (isToday(d)) {
    return `Today at ${format(d, DATE_FORMATS.DISPLAY_TIME)}`;
  }

  if (isYesterday(d)) {
    return `Yesterday at ${format(d, DATE_FORMATS.DISPLAY_TIME)}`;
  }

  return formatDistanceToNow(d, { addSuffix: true });
}

export function toDate(value: Date | string): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

export function getDateRangeForPeriod(
  period: "7d" | "14d" | "30d" | "90d",
): { start: Date; end: Date } {
  const end = endOfDay(new Date());
  const periodMap = {
    "7d": subDays(new Date(), 7),
    "14d": subWeeks(new Date(), 2),
    "30d": subMonths(new Date(), 1),
    "90d": subMonths(new Date(), 3),
  } as const;

  return {
    start: startOfDay(periodMap[period]),
    end,
  };
}

export function getDurationDescription(startDate: Date | string, endDate: Date | string): string {
  const start = toDate(startDate);
  const end = toDate(endDate);
  const minutes = differenceInMinutes(end, start);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = differenceInHours(end, start);
  if (hours < 24) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = differenceInDays(end, start);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}
