import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface AlertCounts {
  critical: number;
  warning: number;
  info: number;
  resolved: number;
}

interface AlertSummaryCardProps {
  counts: AlertCounts;
  totalActive: number;
  onClick?: () => void;
}

const severityItems = [
  {
    key: 'critical' as const,
    label: 'Critical',
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  {
    key: 'warning' as const,
    label: 'Warning',
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    key: 'info' as const,
    label: 'Info',
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    key: 'resolved' as const,
    label: 'Resolved',
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
];

export function AlertSummaryCard({ counts, totalActive, onClick }: AlertSummaryCardProps) {
  return (
    <article
      className={`rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } transition-shadow`}
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Alert summary: ${totalActive} active alerts`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Alert Summary
        </h3>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {totalActive}
          <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
            active
          </span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {severityItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.key}
              className={`flex items-center gap-2 rounded-lg p-2.5 ${item.bg}`}
            >
              <IconComponent className={`h-4 w-4 ${item.color}`} />
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {counts[item.key]}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
