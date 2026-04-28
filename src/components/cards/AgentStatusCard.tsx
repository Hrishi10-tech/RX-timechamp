import { Monitor, Cpu, HardDrive, Wifi } from 'lucide-react';
import { StatusIndicator } from '@/components/common/StatusIndicator';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

type AgentStatus = 'online' | 'offline' | 'idle';

function formatLastSeen(value: string): string {
  if (!value || value === 'Never') return value || 'Never';
  const raw = value.endsWith('Z') || value.includes('+') ? value : value + 'Z';
  const t = new Date(raw).getTime();
  if (Number.isNaN(t)) return value;
  const diffSec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMo = Math.floor(diffDay / 30);
  if (diffMo < 12) return `${diffMo}mo ago`;
  return `${Math.floor(diffMo / 12)}y ago`;
}

interface SparklinePoint {
  value: number;
}

interface AgentStatusCardProps {
  agentId: string;
  deviceName: string;
  userName: string;
  status: AgentStatus;
  cpuUsage: number;
  memoryUsage: number;
  lastSeen: string;
  sparklineData: SparklinePoint[];
  onClick?: (agentId: string) => void;
}

export function AgentStatusCard({
  agentId,
  deviceName,
  userName,
  status,
  cpuUsage,
  memoryUsage,
  lastSeen,
  sparklineData,
  onClick,
}: AgentStatusCardProps) {
  return (
    <article
      className={`rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 ${
        onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md dark:hover:border-blue-600' : ''
      } transition-all`}
      onClick={() => onClick?.(agentId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(agentId);
        }
      }}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Agent ${deviceName} - ${status}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-gray-400" />
            <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {deviceName}
            </h4>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {userName}
          </p>
        </div>
        <StatusIndicator status={status} showLabel />
      </div>

      {/* Sparkline */}
      <div className="my-3 h-12" aria-hidden="true">
        {sparklineData && sparklineData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={status === 'online' ? '#3b82f6' : '#9ca3af'}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400 text-xs">No data available</p>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1" title="CPU Usage">
          <Cpu className="h-3 w-3" />
          <span>{cpuUsage}%</span>
        </div>
        <div className="flex items-center gap-1" title="Memory Usage">
          <HardDrive className="h-3 w-3" />
          <span>{memoryUsage}%</span>
        </div>
        <div className="flex items-center gap-1" title={`Last Seen: ${lastSeen}`}>
          <Wifi className="h-3 w-3" />
          <span>{formatLastSeen(lastSeen)}</span>
        </div>
      </div>
    </article>
  );
}
