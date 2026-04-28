import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Wifi, AlertTriangle, TrendingUp, UserPlus, Download, X, Check, Eye, EyeOff, Clock, Coffee } from 'lucide-react';
import { StatCard } from '@/components/cards/StatCard';
import { AgentStatusCard } from '@/components/cards/AgentStatusCard';
import { AlertSummaryCard } from '@/components/cards/AlertSummaryCard';
import { AppUsagePie } from '@/components/charts/AppUsagePie';
import { TopDomainsBar } from '@/components/charts/TopDomainsBar';
import { RealTimeActivityHeatmap } from '@/components/charts/RealTimeActivityHeatmap';
import { DateRangePicker } from '@/components/filters/DateRangePicker';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getOverview } from '@/api/dashboard';
import { listAlerts } from '@/api/alerts';
import { apiClient } from '@/api/client';
import type { DashboardOverviewResponse } from '@/types/api';

/** Convert decimal hours (e.g. 1.71) to "1h 43m" display string */
function formatHours(decimalHours: number): string {
  if (!decimalHours || decimalHours <= 0) return '0m';
  const totalMinutes = Math.round(decimalHours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

interface DateRange {
  start: string;
  end: string;
}

const PIE_COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#6b7280', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

interface AgentInfo {
  agentId: string;
  userId: string;
  deviceName: string;
  userName: string;
  status: 'online' | 'offline' | 'idle' | 'sleep';
  cpuUsage: number;
  memoryUsage: number;
  lastSeen: string;
}

interface AlertCounts {
  critical: number;
  warning: number;
  info: number;
  resolved: number;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

interface NewEmployee {
  full_name: string;
  email: string;
  password: string;
  role: 'viewer' | 'manager' | 'admin';
}

export function Overview() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>({
    start: formatDate(new Date(Date.now() - 7 * 86400000)),
    end: formatDate(new Date()),
  });

  // Data fetching state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [alertCounts, setAlertCounts] = useState<AlertCounts>({ critical: 0, warning: 0, info: 0, resolved: 0 });
  const [totalActiveAlerts, setTotalActiveAlerts] = useState(0);

  // Add Employee modal state
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    full_name: '', email: '', password: '', role: 'viewer',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Download Agent modal state
  const [showDownloadAgent, setShowDownloadAgent] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch overview — this is the critical call
      const overviewData = await getOverview({ start_date: dateRange.start, end_date: dateRange.end });
      setOverview(overviewData);

      // Fetch alerts — non-critical, fail silently
      try {
        const alertsData = await listAlerts({ per_page: 200 });
        const counts: AlertCounts = { critical: 0, warning: 0, info: 0, resolved: 0 };
        let active = 0;
        for (const alert of alertsData.items ?? []) {
          const sev = (alert.severity ?? '').toLowerCase();
          if (sev === 'critical') counts.critical++;
          else if (sev === 'warning') counts.warning++;
          else if (sev === 'info') counts.info++;
          if (alert.is_read) { counts.resolved++; } else { active++; }
        }
        setAlertCounts(counts);
        setTotalActiveAlerts(active);
      } catch {
        // Alerts endpoint may not be available; use defaults
      }

      // Fetch agents — non-critical, fail silently
      try {
        const agentsRes = await apiClient.get('/admin/agents');
        const rawAgents = agentsRes.data?.items || agentsRes.data || [];
        const now = Date.now();
        const mappedAgents: AgentInfo[] = (Array.isArray(rawAgents) ? rawAgents : []).map((a: Record<string, unknown>) => {
          const hb = (a.last_seen || a.last_heartbeat || a.lastSeen || '') as string;
          // Compute status from heartbeat age
          let status: 'online' | 'offline' | 'idle' | 'sleep' = 'offline';
          const backendStatus = (a.status || '') as string;
          if (backendStatus === 'online' || backendStatus === 'idle' || backendStatus === 'sleep' || backendStatus === 'offline') {
            status = backendStatus as typeof status;
          } else if (hb) {
            const diff = (now - new Date(hb).getTime()) / 1000;
            if (diff < 120) status = 'online';       // < 2 min
            else if (diff < 300) status = 'idle';     // 2-5 min
            else if (diff < 1800) status = 'sleep';   // 5-30 min
            // else offline (> 30 min)
          }
          return {
            agentId: (a.id || '') as string,
            userId: (a.user_id || '') as string,
            deviceName: (a.hostname || 'Unknown') as string,
            userName: (a.employee_name || a.user_name || 'Unknown') as string,
            status,
            cpuUsage: (a.cpu_usage ?? 0) as number,
            memoryUsage: (a.memory_usage ?? 0) as number,
            lastSeen: hb || 'Never',
          };
        });
        setAgents(mappedAgents);
      } catch {
        setAgents([]);
      }
    } catch (err: unknown) {
      console.error('Failed to load overview data:', err);
      setError('Could not load dashboard data. Please check that the backend is running.');
      setOverview(null);
      setAgents([]);
      setAlertCounts({ critical: 0, warning: 0, info: 0, resolved: 0 });
      setTotalActiveAlerts(0);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchData();
    };
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange.start, dateRange.end]);

  const handleAddEmployee = async () => {
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      const res = await apiClient.post('/admin/users', newEmployee);
      setAddSuccess(`Employee "${res.data.full_name}" created successfully! (${res.data.email})`);
      setNewEmployee({ full_name: '', email: '', password: '', role: 'viewer' });
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { detail?: string } } };
      setAddError(axErr.response?.data?.detail ?? 'Failed to create employee');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDownloadAgent = () => {
    // Download the actual Python agent script served by the backend
    const apiHost = window.location.hostname;
    const batContent = [
      '@echo off',
      'title TrackMe Agent Setup',
      'echo.',
      'echo =============================================',
      'echo   TrackMe Desktop Agent - One-Click Setup',
      'echo =============================================',
      'echo.',
      '',
      ':: Check Python',
      'python --version >nul 2>&1',
      'if errorlevel 1 (',
      '    echo ERROR: Python is not installed.',
      '    echo Please install Python 3.10+ from https://python.org',
      '    pause',
      '    exit /b 1',
      ')',
      '',
      ':: Create data directory',
      'if not exist "%PROGRAMDATA%\\TrackMe" mkdir "%PROGRAMDATA%\\TrackMe"',
      '',
      ':: Write config',
      'echo Writing configuration...',
      `echo {"api_base_url":"http://${apiHost}:8000/api/v1","idle_threshold_seconds":60,"sync_interval_seconds":60,"log_level":"INFO"} > "%PROGRAMDATA%\\TrackMe\\config.json"`,
      '',
      ':: Install dependencies',
      'echo.',
      'echo Installing Python packages (psutil, requests)...',
      'python -m pip install psutil requests --quiet 2>nul',
      '',
      ':: Download agent script from backend',
      'echo.',
      'echo Downloading TrackMe agent...',
      `curl -s -o "%PROGRAMDATA%\\TrackMe\\trackme_agent.py" "http://${apiHost}:8000/api/v1/agents/download-script"`,
      '',
      'if not exist "%PROGRAMDATA%\\TrackMe\\trackme_agent.py" (',
      '    echo ERROR: Could not download agent script.',
      '    echo Make sure the backend is running at http://' + apiHost + ':8000',
      '    pause',
      '    exit /b 1',
      ')',
      '',
      ':: Launch agent',
      'echo.',
      'echo =============================================',
      'echo   Starting TrackMe Agent...',
      'echo   Press Ctrl+C to stop',
      'echo =============================================',
      'echo.',
      'cd /d "%PROGRAMDATA%\\TrackMe"',
      'python trackme_agent.py',
      'pause',
    ].join('\r\n');

    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TrackMe-Agent-Setup.bat';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Map API top_apps to the shape AppUsagePie expects
  const appUsageData = (overview?.top_apps ?? []).map((app, i) => ({
    name: app.name,
    duration: Math.round((app.total_hours ?? 0) * 60), // convert hours to minutes
    color: PIE_COLORS[i % PIE_COLORS.length] ?? '#6b7280',
  }));

  // Map API top_domains to the shape TopDomainsBar expects
  const topDomainsData = (overview?.top_domains ?? []).map((d) => ({
    domain: d.domain,
    visits: d.visit_count,
    duration: Math.round((d.total_hours ?? 0) * 60), // convert hours to minutes
  }));

  // Derive stat values from overview (fall back to 0)
  const totalUsers = overview?.total_users ?? 0;
  const activeToday = overview?.active_today ?? 0;
  const avgIdleRatio = overview?.avg_idle_ratio ?? 0;
  const productivityPct = Math.round((1 - avgIdleRatio) * 100);
  const avgActiveHours = overview?.avg_active_hours ?? 0;
  const avgIdleHours = avgActiveHours > 0 ? Math.round(avgActiveHours * avgIdleRatio / (1 - avgIdleRatio) * 10) / 10 : 0;

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading dashboard data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor your organization at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddEmployee(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Employee
          </button>
          <button
            onClick={() => setShowDownloadAgent(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download Agent
          </button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* ── Add Employee Modal ──────────────────────────────────── */}
      {showAddEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Add New Employee
              </h2>
              <button
                onClick={() => { setShowAddEmployee(false); setAddError(null); setAddSuccess(null); }}
                className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              {addSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-300">
                  <Check className="h-4 w-4 flex-shrink-0" />
                  {addSuccess}
                </div>
              )}
              {addError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
                  {addError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newEmployee.full_name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="john@company.com"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 pr-10 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as NewEmployee['role'] })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="viewer">Viewer (Employee)</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <button
                onClick={() => { setShowAddEmployee(false); setAddError(null); setAddSuccess(null); }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                disabled={addLoading || !newEmployee.full_name || !newEmployee.email || !newEmployee.password}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {addLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {addLoading ? 'Creating...' : 'Create Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Download Agent Modal ────────────────────────────────── */}
      {showDownloadAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                Download TrackMe Agent
              </h2>
              <button
                onClick={() => setShowDownloadAgent(false)}
                className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-5 px-6 py-5">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Deploy the TrackMe agent to employee workstations to begin monitoring activity, applications, and productivity.
              </p>

              {/* Agent installer download */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Windows Agent (One-Click Setup)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Downloads a setup script that auto-installs dependencies and starts tracking. Requires Python 3.10+ and Windows 10/11.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadAgent}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download Setup (.bat)
                  </button>
                  <a
                    href="http://localhost:8000/api/v1/agents/installer"
                    className="flex items-center gap-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/30 px-4 py-2.5 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download Installer (.exe)
                  </a>
                </div>
              </div>

              {/* Deployment instructions */}
              <div className="rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">Quick Deployment Guide</h3>
                <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 list-decimal list-inside">
                  <li>First, add the employee using <strong>Add Employee</strong> above</li>
                  <li>Download the <strong>Setup (.bat)</strong> file</li>
                  <li>Send the .bat file to the employee or run it on their workstation</li>
                  <li>Right-click the .bat → <strong>Run as Administrator</strong></li>
                  <li>The script auto-installs dependencies and starts tracking</li>
                  <li>Verify the device appears in <strong>Device Status</strong> page</li>
                </ol>
              </div>

              {/* Bulk deployment */}
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-4">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">Bulk Deployment (GPO / SCCM)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  For large-scale deployments, use the MSI installer with Group Policy or SCCM.
                  See the deployment guide in the docs folder for silent install parameters.
                </p>
                <code className="block mt-2 text-xs bg-gray-200 dark:bg-gray-700 rounded p-2 text-gray-700 dark:text-gray-300">
                  msiexec /i TrackMe.msi /quiet API_URL=https://your-server/api/v1
                </code>
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <button
                onClick={() => setShowDownloadAgent(false)}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Showing default values. Data will refresh when the backend is available.</p>
            </div>
            <button
              onClick={fetchData}
              className="rounded-lg border border-red-300 dark:border-red-700 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stat cards row */}
      <section aria-label="Key statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Total Users"
            value={totalUsers}
            icon={Users}
          />
          <StatCard
            label="Active Today"
            value={activeToday}
            icon={Wifi}
          />
          <StatCard
            label="Avg Working Hours"
            value={formatHours(avgActiveHours)}
            icon={Clock}
          />
          <StatCard
            label="Avg Idle Time"
            value={formatHours(avgIdleHours)}
            icon={Coffee}
          />
          <StatCard
            label="Active Alerts"
            value={totalActiveAlerts}
            icon={AlertTriangle}
          />
          <StatCard
            label="Avg Productivity"
            value={`${productivityPct}%`}
            icon={TrendingUp}
          />
        </div>
      </section>

      {/* Agent status grid */}
      <section aria-label="Agent status">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Agent Status
        </h2>
        {agents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
            <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">No data yet</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Deploy the TrackMe agent to employee workstations to see their status here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentStatusCard
                key={agent.agentId}
                {...agent}
                sparklineData={[]}
                onClick={() => agent.userId && navigate(`/user/${agent.userId}/detail`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Activity heatmap */}
      <section aria-label="Activity heatmap">
        <RealTimeActivityHeatmap data={[]} />
      </section>

      {/* Bottom row: Alert summary + Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section aria-label="Alert summary">
          <AlertSummaryCard
            counts={alertCounts}
            totalActive={totalActiveAlerts}
          />
        </section>
        <section aria-label="Top apps" className="lg:col-span-1">
          {appUsageData.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 h-[280px] flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No data yet</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">App usage data will appear once agents begin reporting.</p>
            </div>
          ) : (
            <AppUsagePie data={appUsageData} height={280} />
          )}
        </section>
        <section aria-label="Top domains" className="lg:col-span-1">
          {topDomainsData.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 h-[280px] flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No data yet</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Domain usage data will appear once agents begin reporting.</p>
            </div>
          ) : (
            <TopDomainsBar data={topDomainsData} height={280} />
          )}
        </section>
      </div>
    </div>
  );
}
