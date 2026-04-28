import { useState, useEffect, useMemo, useCallback } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { AlertsTable } from '@/components/tables/AlertsTable';
import { Badge } from '@/components/common/Badge';
import { SearchInput } from '@/components/common/SearchInput';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { apiClient } from '@/api/client';

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

export function Alerts() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulk, setConfirmBulk] = useState<'resolve' | 'delete' | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get('/admin/alerts')
      .then((res) => {
        const data = res.data.items || res.data.alerts || res.data || [];
        setAlerts(Array.isArray(data) ? data : []);
      })
      .catch(() => setError('Unable to load alerts'))
      .finally(() => setLoading(false));
  }, []);

  const filteredAlerts = useMemo(() => {
    let result = alerts;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(lower) ||
          a.source.toLowerCase().includes(lower)
      );
    }
    if (severityFilter !== 'all') {
      result = result.filter((a) => a.severity === severityFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter);
    }
    return result;
  }, [alerts, search, severityFilter, statusFilter]);

  const handleStatusChange = useCallback((alertId: string, newStatus: AlertStatus) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
    );
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkAction = useCallback(() => {
    if (confirmBulk === 'resolve') {
      setAlerts((prev) =>
        prev.map((a) =>
          selectedIds.has(a.id) ? { ...a, status: 'resolved' } : a
        )
      );
    } else if (confirmBulk === 'delete') {
      setAlerts((prev) => prev.filter((a) => !selectedIds.has(a.id)));
    }
    setSelectedIds(new Set());
    setConfirmBulk(null);
  }, [confirmBulk, selectedIds]);

  const counts = useMemo(() => {
    const c = { critical: 0, warning: 0, info: 0, open: 0, acknowledged: 0, resolved: 0 };
    alerts.forEach((a) => {
      c[a.severity]++;
      c[a.status]++;
    });
    return c;
  }, [alerts]);

  if (loading) {
    return <LoadingSpinner message="Loading alerts..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Bell className="h-6 w-6" />
            Alert Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage system alerts
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Bell className="h-6 w-6" />
          Alert Management
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor and manage system alerts
        </p>
      </div>

      {/* Empty state */}
      {alerts.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <Bell className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No alerts
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            All systems are running normally. Alerts will appear here when issues are detected.
          </p>
        </div>
      )}

      {alerts.length > 0 && (
        <>
          {/* Summary badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="critical" dot>{counts.critical} Critical</Badge>
            <Badge variant="warning" dot>{counts.warning} Warning</Badge>
            <Badge variant="info" dot>{counts.info} Info</Badge>
            <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
            <Badge variant="critical" dot>{counts.open} Open</Badge>
            <Badge variant="warning" dot>{counts.acknowledged} Acknowledged</Badge>
            <Badge variant="success" dot>{counts.resolved} Resolved</Badge>
          </div>

          {/* Filters and bulk actions */}
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search alerts..."
              className="w-64"
            />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'all')}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              aria-label="Filter by severity"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AlertStatus | 'all')}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 border-l border-gray-300 pl-3 dark:border-gray-600">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={() => setConfirmBulk('resolve')}
                  className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                >
                  <CheckCheck className="h-3 w-3" />
                  Resolve
                </button>
                <button
                  onClick={() => setConfirmBulk('delete')}
                  className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Alerts table */}
          <AlertsTable
            alerts={filteredAlerts}
            onStatusChange={handleStatusChange}
            onViewDetail={(id) => toggleSelect(id)}
          />

          {/* Bulk confirm dialog */}
          <ConfirmDialog
            open={confirmBulk !== null}
            title={confirmBulk === 'resolve' ? 'Resolve Alerts' : 'Delete Alerts'}
            message={`Are you sure you want to ${confirmBulk} ${selectedIds.size} selected alert(s)?`}
            confirmLabel={confirmBulk === 'resolve' ? 'Resolve All' : 'Delete All'}
            variant={confirmBulk === 'delete' ? 'danger' : 'default'}
            onConfirm={handleBulkAction}
            onCancel={() => setConfirmBulk(null)}
          />
        </>
      )}
    </div>
  );
}
