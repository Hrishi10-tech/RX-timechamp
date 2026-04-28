type StatusType = 'online' | 'offline' | 'idle' | 'sleep' | 'busy';

interface StatusIndicatorProps {
  status: StatusType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, { color: string; pulseColor: string; label: string }> = {
  online: {
    color: 'bg-green-500',
    pulseColor: 'bg-green-400',
    label: 'Online',
  },
  offline: {
    color: 'bg-gray-400',
    pulseColor: 'bg-gray-300',
    label: 'Offline',
  },
  idle: {
    color: 'bg-yellow-500',
    pulseColor: 'bg-yellow-400',
    label: 'Idle',
  },
  sleep: {
    color: 'bg-blue-400',
    pulseColor: 'bg-blue-300',
    label: 'Sleep',
  },
  busy: {
    color: 'bg-red-500',
    pulseColor: 'bg-red-400',
    label: 'Busy',
  },
};

const sizeClasses: Record<string, string> = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

export function StatusIndicator({
  status,
  showLabel = false,
  size = 'md',
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <span className="inline-flex items-center gap-2" role="status" aria-label={config.label}>
      <span className="relative inline-flex">
        <span className={`rounded-full ${config.color} ${sizeClasses[size]}`} />
        {status === 'online' && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.pulseColor} opacity-75`}
          />
        )}
      </span>
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {config.label}
        </span>
      )}
    </span>
  );
}
