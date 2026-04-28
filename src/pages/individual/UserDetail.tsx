import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { User, Monitor, Clock, Globe, AppWindow, Camera, Activity, Coffee, TrendingUp, LogIn, LogOut } from 'lucide-react';
import { apiClient } from '@/api/client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { ActivityTimeline } from '@/components/charts/ActivityTimeline';
import { AppUsagePie } from '@/components/charts/AppUsagePie';
import { StatusIndicator } from '@/components/common/StatusIndicator';
import { Badge } from '@/components/common/Badge';
import { DataTable } from '@/components/tables/DataTable';

// ── Helpers ─────────────────────────────────────────────────────────

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

// ── Column definitions ──────────────────────────────────────────────

interface AppUsageRow {
  name: string;
  category: string;
  duration: number;
  sessions: number;
  productive: boolean;
  [key: string]: unknown;
}

interface BrowsingRow {
  domain: string;
  title: string;
  visits: number;
  duration: number;
  category: string;
  [key: string]: unknown;
}

interface UrlVisitRow {
  url: string;
  domain: string;
  page_title: string;
  browser: string;
  duration_sec: number;
  visit_time: string;
  [key: string]: unknown;
}

interface ScreenshotItem {
  id: string;
  captured_at: string;
  download_url: string;
  file_size: number;
}

const appColumns = [
  { key: 'name', header: 'Application', sortable: true },
  { key: 'category', header: 'Category', sortable: true },
  {
    key: 'duration',
    header: 'Duration (min)',
    sortable: true,
    render: (row: AppUsageRow) => <span>{row.duration}m</span>,
  },
  { key: 'sessions', header: 'Sessions', sortable: true },
  {
    key: 'productive',
    header: 'Productive',
    render: (row: AppUsageRow) => (
      <Badge variant={row.productive ? 'success' : 'warning'}>
        {row.productive ? 'Yes' : 'No'}
      </Badge>
    ),
  },
];

const urlColumns = [
  { key: 'domain', header: 'App / Domain', sortable: true },
  { key: 'page_title', header: 'Title / Window', sortable: true },
  { key: 'browser', header: 'Source', sortable: true },
  {
    key: 'duration_sec',
    header: 'Duration',
    sortable: true,
    render: (row: UrlVisitRow) => {
      const sec = row.duration_sec || 0;
      return <span>{sec >= 60 ? `${Math.round(sec / 60)}m` : `${sec}s`}</span>;
    },
  },
  {
    key: 'visit_time',
    header: 'Visited At',
    sortable: true,
    render: (row: UrlVisitRow) => {
      if (!row.visit_time) return <span className="text-xs">N/A</span>;
      const ts = row.visit_time.endsWith('Z') || row.visit_time.includes('+') ? row.visit_time : row.visit_time + 'Z';
      return <span className="text-xs">{new Date(ts).toLocaleString()}</span>;
    },
  },
];

const browsingColumns = [
  { key: 'domain', header: 'Domain', sortable: true },
  { key: 'title', header: 'Title', sortable: true },
  { key: 'visits', header: 'Visits', sortable: true },
  {
    key: 'duration',
    header: 'Duration (min)',
    sortable: true,
    render: (row: BrowsingRow) => <span>{row.duration}m</span>,
  },
  { key: 'category', header: 'Category', sortable: true },
];

// ── Tab types ────────────────────────────────────────────────────────

type TabId = 'overview' | 'urls' | 'screenshots';
type PeriodFilter = 'daily' | 'weekly' | 'monthly' | 'yearly';

const TABS: { id: TabId; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'urls', label: 'Activity Log', icon: Globe },
  { id: 'screenshots', label: 'Screenshots', icon: Camera },
];

const PERIOD_OPTIONS: { label: string; value: PeriodFilter }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

function getPeriodDates(period: PeriodFilter, offsetDays = 0): { start_date: string; end_date: string } {
  const now = new Date();
  const base = new Date(now.getTime() - offsetDays * 86400000);
  const end = base.toISOString().split('T')[0]!;
  let start: string;
  switch (period) {
    case 'weekly':
      start = new Date(base.getTime() - 6 * 86400000).toISOString().split('T')[0]!;
      break;
    case 'monthly':
      start = new Date(base.getTime() - 29 * 86400000).toISOString().split('T')[0]!;
      break;
    case 'yearly':
      start = new Date(base.getTime() - 364 * 86400000).toISOString().split('T')[0]!;
      break;
    default: // daily
      start = end;
      break;
  }
  return { start_date: start, end_date: end };
}

const PIE_COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#6b7280', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

// ── Component ────────────────────────────────────────────────────────

export function UserDetail() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const authUser = useAuthStore((s) => s.user);

  const rawUserId = params.userId || searchParams.get('userId');
  const userId = rawUserId === 'me' ? authUser?.id : rawUserId;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [period, setPeriod] = useState<PeriodFilter>('daily');

  // Overview tab data
  const [appUsageData, setAppUsageData] = useState<AppUsageRow[]>([]);
  const [browsingData, setBrowsingData] = useState<BrowsingRow[]>([]);
  const [appPieData, setAppPieData] = useState<any[]>([]);
  const [workStats, setWorkStats] = useState<{ activeHours: number; idleHours: number; productivityScore: number; firstActivity?: string; lastActivity?: string } | null>(null);
  const [effectiveDate, setEffectiveDate] = useState<string | null>(null);

  // URLs tab data
  const [urlVisits, setUrlVisits] = useState<UrlVisitRow[]>([]);
  const [urlsLoading, setUrlsLoading] = useState(false);

  // Screenshots tab data
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [screenshotsLoading, setScreenshotsLoading] = useState(false);

  // Fetch main user data + overview tab
  useEffect(() => {
    if (rawUserId === 'me' && !authUser?.id) {
      setLoading(false);
      return;
    }
    if (!userId) {
      setError('No user ID provided. Select a user from the Team Dashboard.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      // For daily, fall back up to 7 days if today has no data
      let start_date: string = new Date().toISOString().split('T')[0]!;
      let end_date: string = start_date;
      let dashRes: any = { data: null };

      if (period === 'daily') {
        for (let i = 0; i <= 7; i++) {
          const dates = getPeriodDates('daily', i);
          start_date = dates.start_date;
          end_date = dates.end_date;
          dashRes = await apiClient.get(`/dashboard/user/${userId}`, { params: { start_date, end_date } }).catch(() => ({ data: null }));
          if (dashRes.data && (dashRes.data.total_active_hours > 0 || dashRes.data.total_idle_hours > 0 || dashRes.data.first_activity || (dashRes.data.top_apps && dashRes.data.top_apps.length > 0))) {
            break;
          }
        }
        setEffectiveDate(end_date!);
      } else {
        const dates = getPeriodDates(period);
        start_date = dates.start_date;
        end_date = dates.end_date;
        dashRes = await apiClient.get(`/dashboard/user/${userId}`, { params: { start_date, end_date } }).catch(() => ({ data: null }));
        setEffectiveDate(null);
      }

      try {
        const [usersRes, appsRes, topAppsRes, urlsRes] = await Promise.all([
          apiClient.get('/admin/users'),
          apiClient.get('/apps/usage', { params: { user_id: userId, per_page: 100, start_date, end_date } }).catch(() => ({ data: [] })),
          apiClient.get('/apps/top', { params: { user_id: userId, limit: 10, start_date, end_date } }).catch(() => ({ data: [] })),
          apiClient.get('/urls/top-domains', { params: { user_id: userId, start_date, end_date } }).catch(() => ({ data: [] })),
        ]);

        const allUsers = usersRes.data.items || usersRes.data.users || usersRes.data || [];
        const foundUser = allUsers.find((u: any) => String(u.id) === String(userId));

        if (foundUser) {
          // Enrich with device info from agents
          try {
            const agentsRes = await apiClient.get('/admin/agents');
            const agents = agentsRes.data?.items || agentsRes.data || [];
            const userAgent = (Array.isArray(agents) ? agents : []).find(
              (a: any) => a.user_id === userId || a.user_name === foundUser.full_name
            );
            if (userAgent) {
              foundUser.deviceName = userAgent.hostname;
              foundUser.status = userAgent.status;
              foundUser.lastActive = userAgent.last_seen ? new Date(userAgent.last_seen.endsWith('Z') || userAgent.last_seen.includes('+') ? userAgent.last_seen : userAgent.last_seen + 'Z').toLocaleString() : null;
            }
          } catch { /* ignore */ }
          setUser(foundUser);
        } else if (rawUserId === 'me' && authUser) {
          setUser({ id: authUser.id, full_name: authUser.full_name, email: authUser.email, role: authUser.role });
        } else {
          setError('User not found.');
        }

        // App usage table
        const rawApps = appsRes.data.items || appsRes.data.records || appsRes.data || [];
        setAppUsageData(Array.isArray(rawApps) ? rawApps.map((a: any) => ({
          name: a.process_name || a.name || 'Unknown',
          category: a.category || 'General',
          duration: Math.round((a.duration_sec || a.duration || 0) / 60),
          sessions: a.session_count || a.sessions || 1,
          productive: a.productive ?? true,
        })) : []);

        // Top apps pie chart
        const rawTop = topAppsRes.data.items || topAppsRes.data || [];
        setAppPieData((Array.isArray(rawTop) ? rawTop : []).map((a: any, i: number) => ({
          name: a.name || a.process_name || 'Unknown',
          duration: Math.round((a.total_hours || 0) * 60),
          color: PIE_COLORS[i % PIE_COLORS.length],
        })));

        // Browsing top domains
        const rawUrls = urlsRes.data.items || urlsRes.data.domains || urlsRes.data || [];
        setBrowsingData(Array.isArray(rawUrls) ? rawUrls.map((d: any) => ({
          domain: d.domain || '',
          title: d.domain || '',
          visits: d.visit_count || 0,
          duration: Math.round((d.total_hours || 0) * 60),
          category: 'Web',
        })) : []);

        // Working hours stats from dashboard endpoint
        if (dashRes.data) {
          setWorkStats({
            activeHours: dashRes.data.total_active_hours ?? 0,
            idleHours: dashRes.data.total_idle_hours ?? 0,
            productivityScore: dashRes.data.productivity_score ?? 0,
            firstActivity: dashRes.data.first_activity ?? undefined,
            lastActivity: dashRes.data.last_activity ?? undefined,
          });
        } else {
          setWorkStats({ activeHours: 0, idleHours: 0, productivityScore: 0 });
        }
      } catch {
        if (rawUserId === 'me' && authUser) {
          setUser({ id: authUser.id, full_name: authUser.full_name, email: authUser.email, role: authUser.role });
        } else {
          setError('Unable to load user details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, rawUserId, authUser, period]);

  // Load Activity Log tab (URL visits + app usage + sessions merged).
  // For "Daily", walks back up to 14 days to find the most recent day that
  // has any activity. Sessions are included so newly-installed agents that
  // haven't yet switched apps still show meaningful activity (idle/active
  // transitions) instead of an empty "No URL visits" state.
  useEffect(() => {
    if (activeTab !== 'urls' || !userId) return;
    setUrlsLoading(true);

    const fetchOnce = (dates: { start_date: string; end_date: string }) =>
      Promise.all([
        apiClient.get('/urls/visits', { params: { user_id: userId, per_page: 100, ...dates } }).catch(() => ({ data: [] })),
        apiClient.get('/apps/usage', { params: { user_id: userId, per_page: 100, ...dates } }).catch(() => ({ data: [] })),
        apiClient.get('/activity/sessions', { params: { user_id: userId, per_page: 100, ...dates } }).catch(() => ({ data: [] })),
      ]).then(([urlsRes, appsRes, sessRes]) => {
        const rawUrls = urlsRes.data.items || urlsRes.data.visits || urlsRes.data || [];
        const rawApps = appsRes.data.items || appsRes.data.records || appsRes.data || [];
        const rawSess = sessRes.data.items || sessRes.data.sessions || sessRes.data || [];

        const appRows = (Array.isArray(rawApps) ? rawApps : [])
          .filter((a: any) => (a.duration_sec || a.duration || 0) > 2)
          .map((a: any) => ({
            url: '',
            domain: a.process_name || a.name || 'Unknown',
            page_title: a.window_title || '',
            browser: 'desktop app',
            duration_sec: a.duration_sec || a.duration || 0,
            visit_time: a.start_time,
          }));

        // Sessions appear as activity events (active / idle / away)
        const sessRows = (Array.isArray(rawSess) ? rawSess : [])
          .filter((s: any) => (s.duration_sec || 0) > 0)
          .map((s: any) => {
            const t = (s.session_type || 'active').toLowerCase();
            const label = t === 'active' ? 'Active' : t === 'idle' ? 'Idle' : t === 'away' ? 'Away' : t === 'locked' ? 'Locked' : t;
            return {
              url: '',
              domain: label,
              page_title: `${label} session`,
              browser: 'session',
              duration_sec: s.duration_sec || 0,
              visit_time: s.start_time,
            };
          });

        const urlRows = Array.isArray(rawUrls) ? rawUrls : [];
        return [...urlRows, ...appRows, ...sessRows].sort((a: any, b: any) => {
          const ta = a.visit_time || a.start_time || '';
          const tb = b.visit_time || b.start_time || '';
          return tb.localeCompare(ta);
        });
      });

    const run = async () => {
      let combined: any[] = [];
      if (period === 'daily') {
        for (let i = 0; i <= 14; i++) {
          const dates = getPeriodDates('daily', i);
          combined = await fetchOnce(dates);
          if (combined.length > 0) break;
        }
      } else {
        combined = await fetchOnce(getPeriodDates(period));
      }
      setUrlVisits(combined);
    };

    run().catch(() => setUrlVisits([])).finally(() => setUrlsLoading(false));
  }, [activeTab, userId, period, effectiveDate]);

  // Load Screenshots tab (refetch when period, tab, or effectiveDate changes)
  // For "Daily", we walk back up to 14 days to find the most recent day
  // that has screenshots (independent of Overview's effectiveDate, since
  // sessions/apps may exist for a day even when screenshots haven't been
  // captured/synced yet).
  useEffect(() => {
    if (activeTab !== 'screenshots' || !userId) return;
    setScreenshotsLoading(true);
    const baseUrl = apiClient.defaults.baseURL || '';

    const fetchOnce = (dates: { start_date: string; end_date: string }) =>
      apiClient
        .get('/screenshots', { params: { user_id: userId, per_page: 50, ...dates } })
        .then((res) => res.data.items || res.data.screenshots || res.data || [])
        .catch(() => []);

    const run = async () => {
      let raw: any[] = [];
      if (period === 'daily') {
        for (let i = 0; i <= 14; i++) {
          const dates = getPeriodDates('daily', i);
          raw = await fetchOnce(dates);
          if (Array.isArray(raw) && raw.length > 0) {
            break;
          }
        }
      } else {
        const dates = getPeriodDates(period);
        raw = await fetchOnce(dates);
      }
      setScreenshots((Array.isArray(raw) ? raw : []).map((s: any) => ({
        ...s,
        download_url: s.download_url
          ? (s.download_url.startsWith('http') ? s.download_url : baseUrl + s.download_url)
          : '',
      })));
    };

    run().finally(() => setScreenshotsLoading(false));
  }, [activeTab, userId, period, effectiveDate]);

  if (loading) return <LoadingSpinner message="Loading user details..." />;
  if (error) return (
    <div className="flex items-center justify-center py-12">
      <div className="rounded-lg bg-red-50 p-6 text-center text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">{error}</div>
    </div>
  );
  if (!user) return (
    <div className="flex items-center justify-center py-16">
      <p className="text-gray-500 dark:text-gray-400">User not found.</p>
    </div>
  );

  const displayName = user.name || user.full_name || 'Unknown';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <div className="space-y-6">
      {/* ── User Header ──────────────────────────────────────────── */}
      <section aria-label="User information">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
                {user.status && <StatusIndicator status={user.status} showLabel />}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {user.role || 'N/A'} {user.department ? `- ${user.department}` : ''}
              </p>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{user.email || 'N/A'}</span>
                {user.deviceName && <span className="flex items-center gap-1"><Monitor className="h-3 w-3" />{user.deviceName}</span>}
                {user.lastActive && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Last active: {user.lastActive}</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs + Period Filter ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-6" aria-label="Detail tabs">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                  active
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        {/* Period filter */}
        <div className="flex flex-col items-end gap-1 mb-px shrink-0">
          <div className="flex gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {period === 'daily' && effectiveDate && effectiveDate !== new Date().toISOString().split('T')[0] && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400">
              Showing last active: {new Date(effectiveDate + 'T12:00:00').toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* ── Tab Content ───────────────────────────────────────────── */}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Working hours stat cards */}
          {workStats && (
            <section aria-label="Work statistics">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <LogIn className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Login Time</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {workStats.firstActivity
                          ? new Date(workStats.firstActivity.endsWith('Z') || workStats.firstActivity.includes('+') ? workStats.firstActivity : workStats.firstActivity + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Working Time</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{formatHours(workStats.activeHours)}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                      <Coffee className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Idle Time</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{formatHours(workStats.idleHours)}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Productivity Score</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{workStats.productivityScore}%</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const isStillActive = user.status === 'online' || (workStats.lastActivity && (Date.now() - new Date(workStats.lastActivity.endsWith('Z') || workStats.lastActivity.includes('+') ? workStats.lastActivity : workStats.lastActivity + 'Z').getTime()) < 10 * 60 * 1000);
                      return (
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isStillActive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          <LogOut className={`h-5 w-5 ${isStillActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                        </div>
                      );
                    })()}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Logout Time</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {(() => {
                          if (!workStats.lastActivity) return '—';
                          const lastTs = new Date(workStats.lastActivity.endsWith('Z') || workStats.lastActivity.includes('+') ? workStats.lastActivity : workStats.lastActivity + 'Z');
                          const isStillActive = user.status === 'online' || (Date.now() - lastTs.getTime()) < 10 * 60 * 1000;
                          if (isStillActive) return 'Still Active';
                          return lastTs.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section aria-label="Activity timeline">
            <ActivityTimeline data={[]} />
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section aria-label="App usage chart">
              {appPieData.length > 0 ? (
                <AppUsagePie data={appPieData} height={280} />
              ) : (
                <div className="flex items-center justify-center h-[280px] rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No app usage data</p>
                </div>
              )}
            </section>
            <section aria-label="Device status">
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Device Information</h3>
                <dl className="space-y-3">
                  {[
                    { label: 'Device Name', value: user.deviceName || 'N/A', icon: Monitor },
                    { label: 'Status', value: user.status ?? 'N/A', icon: AppWindow },
                    { label: 'Department', value: user.department || user.role || 'N/A', icon: User },
                    { label: 'Last Active', value: user.lastActive ?? 'N/A', icon: Clock },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-gray-400" />
                      <dt className="w-28 text-sm text-gray-500 dark:text-gray-400">{item.label}</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          </div>

          <section aria-label="Application usage table">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              <AppWindow className="mr-2 inline h-5 w-5" />Application Usage
            </h2>
            {appUsageData.length > 0 ? (
              <DataTable columns={appColumns} data={appUsageData} keyExtractor={(row) => row.name} searchable searchKeys={['name', 'category']} exportable />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">No application usage data available.</div>
            )}
          </section>

          <section aria-label="Top domains">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              <Globe className="mr-2 inline h-5 w-5" />Top Domains
            </h2>
            {browsingData.length > 0 ? (
              <DataTable columns={browsingColumns} data={browsingData} keyExtractor={(row) => row.domain} searchable searchKeys={['domain']} exportable />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">No browsing data available.</div>
            )}
          </section>
        </>
      )}

      {/* URLs Tab */}
      {activeTab === 'urls' && (
        <section aria-label="URL visits">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            <Globe className="mr-2 inline h-5 w-5" />Activity Log
          </h2>
          {urlsLoading ? (
            <LoadingSpinner message="Loading URL history..." />
          ) : urlVisits.length > 0 ? (
            <DataTable columns={urlColumns} data={urlVisits} keyExtractor={(row: UrlVisitRow) => `${row.url}-${row.visit_time}`} searchable searchKeys={['domain', 'page_title', 'url']} exportable />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <Globe className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No URL visits recorded for this user.</p>
            </div>
          )}
        </section>
      )}

      {/* Screenshots Tab */}
      {activeTab === 'screenshots' && (
        <section aria-label="Screenshots">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            <Camera className="mr-2 inline h-5 w-5" />Captured Screenshots
          </h2>
          {screenshotsLoading ? (
            <LoadingSpinner message="Loading screenshots..." />
          ) : screenshots.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {screenshots.map((ss) => (
                <div
                  key={ss.id}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={ss.download_url}
                      alt={`Screenshot captured at ${ss.captured_at}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3" />
                      <time>{new Date(ss.captured_at.endsWith('Z') || ss.captured_at.includes('+') ? ss.captured_at : ss.captured_at + 'Z').toLocaleString()}</time>
                    </div>
                    {ss.file_size > 0 && (
                      <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                        {(ss.file_size / 1024).toFixed(0)} KB
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <Camera className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No screenshots captured for this user.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
