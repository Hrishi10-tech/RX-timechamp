import { useState, useEffect, useMemo, useCallback } from 'react';
import { HardDrive, RefreshCw } from 'lucide-react';
import { AgentStatusCard } from '@/components/cards/AgentStatusCard';
import { SearchInput } from '@/components/common/SearchInput';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { apiClient } from '@/api/client';

type AgentStatus = 'online' | 'offline' | 'idle';

interface AgentDevice {
  agentId: string;
  deviceName: string;
  userName: string;
  status: AgentStatus;
  cpuUsage: number;
  memoryUsage: number;
  lastSeen: string;
  osVersion: string;
  agentVersion: string;
}

export function DeviceStatus() {
  const [devices, setDevices] = useState<AgentDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchDevices = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get('/admin/agents')
      .then((res) => {
        const raw = res.data.items || res.data.agents || res.data || [];
        const now = Date.now();
        const mapped: AgentDevice[] = (Array.isArray(raw) ? raw : []).map((agent: any) => {
          const hb = agent.last_seen || agent.last_heartbeat || agent.lastSeen;
          // Trust backend-computed status first; fall back to local heartbeat check
          const backendStatus = agent.status as string | undefined;
          let status: AgentStatus;
          if (backendStatus === 'online' || backendStatus === 'idle' || backendStatus === 'offline') {
            status = backendStatus;
          } else if (hb) {
            const diff = (now - new Date(hb).getTime()) / 1000;
            status = diff < 300 ? 'online' : diff < 900 ? 'idle' : 'offline';
          } else {
            status = 'offline';
          }
          return {
            agentId: agent.agent_id || agent.agentId || agent.id || '',
            deviceName: agent.device_name || agent.deviceName || agent.hostname || 'Unknown',
            userName: agent.user_name || agent.userName || agent.employee_name || 'Unknown',
            status,
            cpuUsage: agent.cpu_usage ?? agent.cpuUsage ?? 0,
            memoryUsage: agent.memory_usage ?? agent.memoryUsage ?? 0,
            lastSeen: hb || 'Never',
            osVersion: agent.os_version || agent.osVersion || 'Unknown',
            agentVersion: agent.agent_version || agent.agentVersion || 'Unknown',
          };
        });
        setDevices(mapped);
      })
      .catch(() => setError('Unable to load devices'))
      .finally(() => {
        setLoading(false);
        setLastRefresh(new Date());
      });
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const filteredDevices = useMemo(() => {
    let result = devices;
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.deviceName.toLowerCase().includes(lower) ||
          d.userName.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [devices, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { online: 0, offline: 0, idle: 0 };
    devices.forEach((d) => {
      if (counts[d.status] !== undefined) counts[d.status]++;
    });
    return counts;
  }, [devices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <HardDrive className="h-6 w-6" />
            Device Status
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time monitoring of all connected devices
          </p>
        </div>
        <button
          onClick={fetchDevices}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
          aria-label="Refresh device status"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
          <span className="text-xs text-gray-400">
            {lastRefresh.toLocaleTimeString()}
          </span>
        </button>
      </div>

      {/* Loading */}
      {loading && <LoadingSpinner message="Loading devices..." />}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && devices.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <HardDrive className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No devices connected
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Deploy the agent on employee devices to start monitoring.
          </p>
        </div>
      )}

      {!loading && !error && devices.length > 0 && (
        <>
          {/* Status summary */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="success" dot size="md">
              {statusCounts.online} Online
            </Badge>
            <Badge variant="warning" dot size="md">
              {statusCounts.idle} Idle
            </Badge>
            <Badge variant="critical" dot size="md">
              {statusCounts.offline} Offline
            </Badge>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search devices or users..."
              className="w-64"
            />
            <div className="flex gap-1 rounded-lg border border-gray-300 p-0.5 dark:border-gray-600">
              {(['all', 'online', 'idle', 'offline'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                  aria-pressed={statusFilter === status}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Device grid */}
          <section aria-label="Device status cards">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDevices.map((device) => (
                <AgentStatusCard
                  key={device.agentId}
                  agentId={device.agentId}
                  deviceName={device.deviceName}
                  userName={device.userName}
                  status={device.status}
                  cpuUsage={device.cpuUsage}
                  memoryUsage={device.memoryUsage}
                  lastSeen={device.lastSeen}
                  sparklineData={[]}
                />
              ))}
              {filteredDevices.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                  No devices match your filters
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
