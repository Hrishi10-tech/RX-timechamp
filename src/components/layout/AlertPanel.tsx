import { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';

type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  read: boolean;
}

interface AlertPanelProps {
  onClose: () => void;
}

const severityConfig: Record<
  AlertSeverity,
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  critical: { icon: AlertCircle, color: 'text-red-500' },
  warning: { icon: AlertTriangle, color: 'text-yellow-500' },
  info: { icon: Info, color: 'text-blue-500' },
  success: { icon: CheckCircle, color: 'text-green-500' },
};

const mockAlerts: AlertNotification[] = [
  {
    id: '1',
    title: 'Agent Offline',
    message: 'Agent on device WS-042 has been offline for 15 minutes.',
    severity: 'critical',
    timestamp: '2 min ago',
    read: false,
  },
  {
    id: '2',
    title: 'High CPU Usage',
    message: 'CPU usage exceeded 90% on server SRV-01.',
    severity: 'warning',
    timestamp: '10 min ago',
    read: false,
  },
  {
    id: '3',
    title: 'Report Generated',
    message: 'Weekly productivity report is ready for download.',
    severity: 'info',
    timestamp: '1 hr ago',
    read: true,
  },
];

export function AlertPanel({ onClose }: AlertPanelProps) {
  const [alerts, setAlerts] = useState<AlertNotification[]>(mockAlerts);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800"
      role="dialog"
      aria-label="Notifications panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Notifications
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Mark all read
          </button>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close notifications"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Alert list */}
      <ul className="max-h-96 overflow-y-auto" role="list" aria-label="Notification list">
        {alerts.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No notifications
          </li>
        ) : (
          alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const IconComponent = config.icon;
            return (
              <li
                key={alert.id}
                className={`flex gap-3 border-b border-gray-100 px-4 py-3 last:border-0 dark:border-gray-700 ${
                  !alert.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <IconComponent className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {alert.message}
                  </p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    {alert.timestamp}
                  </p>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label={`Dismiss ${alert.title}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            );
          })
        )}
      </ul>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
        <button className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          View all notifications
        </button>
      </div>
    </div>
  );
}
