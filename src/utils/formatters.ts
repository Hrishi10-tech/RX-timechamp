/** Number, duration, and byte size formatters. */

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1048576;
const BYTES_PER_GB = 1073741824;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const PERCENTAGE_MULTIPLIER = 100;

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * PERCENTAGE_MULTIPLIER).toFixed(decimals)}%`;
}

export function formatPercentageRaw(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDurationFromSeconds(totalSeconds: number): string {
  if (totalSeconds < SECONDS_PER_MINUTE) {
    return `${Math.round(totalSeconds)}s`;
  }

  if (totalSeconds < SECONDS_PER_HOUR) {
    const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
    const seconds = Math.round(totalSeconds % SECONDS_PER_MINUTE);
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.round((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatDurationFromHours(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * MINUTES_PER_HOUR);
    return `${minutes}m`;
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * MINUTES_PER_HOUR);
  return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
}

export function formatHoursDecimal(hours: number, decimals = 1): string {
  return `${hours.toFixed(decimals)}h`;
}

export function formatBytes(bytes: number): string {
  if (bytes < BYTES_PER_KB) {
    return `${bytes} B`;
  }

  if (bytes < BYTES_PER_MB) {
    return `${(bytes / BYTES_PER_KB).toFixed(1)} KB`;
  }

  if (bytes < BYTES_PER_GB) {
    return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
  }

  return `${(bytes / BYTES_PER_GB).toFixed(2)} GB`;
}

export function formatProductivityScore(score: number): string {
  return `${Math.round(score)}`;
}

export function getProductivityLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  if (score >= 20) return "Below Average";
  return "Low";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}
