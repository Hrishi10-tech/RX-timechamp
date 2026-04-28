import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  className?: string;
}

const trendConfig = {
  up: {
    icon: TrendingUp,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  down: {
    icon: TrendingDown,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  neutral: {
    icon: Minus,
    color: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-700',
  },
};

export function StatCard({ label, value, icon: Icon, trend, className = '' }: StatCardProps) {
  return (
    <article
      className={`rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 ${className}`}
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${trendConfig[trend.direction].bg} ${trendConfig[trend.direction].color}`}
          >
            {(() => {
              const TrendIcon = trendConfig[trend.direction].icon;
              return <TrendIcon className="h-3 w-3" />;
            })()}
            {trend.value > 0 ? '+' : ''}
            {trend.value}%
          </span>
          {trend.label && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
