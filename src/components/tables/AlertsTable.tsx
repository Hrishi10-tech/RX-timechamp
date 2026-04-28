import { useState, useCallback } from 'react';
import { AlertCircle, AlertTriangle, Info, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Pagination } from '@/components/common/Pagination';

type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertStatus = 'open' | 'acknowledged' | 'resolved';

interface AlertRow {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  source: string;
  timestamp: string;
  assignee?: string;
}

interface AlertsTableProps {
  alerts: AlertRow[];
  onStatusChange?: (alertId: string, newStatus: AlertStatus) => void;
  onViewDetail?: (alertId: string) => void;
  pageSize?: number;
}

const severityIcons: Record<AlertSeverity, React.ComponentType<{ className?: string }>> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const severityBadge: Record<AlertSeverity, 'critical' | 'warning' | 'info'> = {
  critical: 'critical',
  warning: 'warning',
  info: 'info',
};

const statusOptions: { value: AlertStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'resolved', label: 'Resolved' },
];

const statusBadgeVariant: Record<AlertStatus, 'critical' | 'warning' | 'success'> = {
  open: 'critical',
  acknowledged: 'warning',
  resolved: 'success',
};

export function AlertsTable({
  alerts,
  onStatusChange,
  onViewDetail,
  pageSize = 10,
}: AlertsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(alerts.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const pageAlerts = alerts.slice(start, start + pageSize);

  const handleStatusChange = useCallback(
    (alertId: string, status: AlertStatus) => {
      onStatusChange?.(alertId, status);
    },
    [onStatusChange]
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" role="grid" aria-label="Alerts table">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
              <th scope="col" className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                Severity
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                Title
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                Source
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                Time
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pageAlerts.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  No alerts found
                </td>
              </tr>
            ) : (
              pageAlerts.map((alert) => {
                const SeverityIcon = severityIcons[alert.severity];
                return (
                  <tr
                    key={alert.id}
                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <SeverityIcon
                          className={`h-4 w-4 ${
                            alert.severity === 'critical'
                              ? 'text-red-500'
                              : alert.severity === 'warning'
                                ? 'text-yellow-500'
                                : 'text-blue-500'
                          }`}
                        />
                        <Badge variant={severityBadge[alert.severity]}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {alert.title}
                    </td>
                    <td className="px-4 py-3">
                      {onStatusChange ? (
                        <select
                          value={alert.status}
                          onChange={(e) =>
                            handleStatusChange(
                              alert.id,
                              e.target.value as AlertStatus
                            )
                          }
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          aria-label={`Change status for ${alert.title}`}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Badge variant={statusBadgeVariant[alert.status]} dot>
                          {alert.status}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {alert.source}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">{alert.timestamp}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {onViewDetail && (
                        <button
                          onClick={() => onViewDetail(alert.id)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                          aria-label={`View details for ${alert.title}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {alerts.length} total alerts
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
