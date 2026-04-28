import { useState, useEffect, useCallback, useMemo } from 'react';
import { Camera, Users } from 'lucide-react';
import { ScreenshotGallery } from '@/components/tables/ScreenshotGallery';
import { ScreenshotLightbox } from '@/components/modals/ScreenshotLightbox';
import { SearchInput } from '@/components/common/SearchInput';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { apiClient } from '@/api/client';

type PeriodFilter = 'daily' | 'weekly' | 'monthly' | 'yearly';

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

interface ScreenshotItem {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  userName: string;
  deviceName: string;
  capturedAt: string;
  applicationName?: string;
}

export function Screenshots() {
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>('daily');
  const [effectiveDate, setEffectiveDate] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([]);
  const [devices, setDevices] = useState<{ id: string; hostname: string; user_id?: string; user_name?: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Fetch users + devices for name joining
  useEffect(() => {
    apiClient.get('/admin/users').then((res) => {
      const data = res.data.items || res.data.users || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    }).catch(() => {});
    apiClient.get('/admin/agents').then((res) => {
      const data = Array.isArray(res.data) ? res.data : (res.data.items || res.data.agents || []);
      setDevices(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchWithFallback = async () => {
      const baseUrl = apiClient.defaults.baseURL || '';

      // For daily: fall back up to 7 days if today has no screenshots
      let dates = getPeriodDates(period);
      if (period === 'daily') {
        for (let i = 0; i <= 7; i++) {
          dates = getPeriodDates('daily', i);
          try {
            const params: any = { page: 1, per_page: 50, start_date: dates.start_date, end_date: dates.end_date };
            if (selectedUserId) params.user_id = selectedUserId;
            const res = await apiClient.get('/screenshots', { params });
            const raw = res.data.items || res.data.screenshots || res.data || [];
            if (Array.isArray(raw) && raw.length > 0) {
              setEffectiveDate(dates.end_date);
              return raw;
            }
          } catch { /* continue */ }
        }
        setEffectiveDate(dates.end_date);
        return [];
      }

      setEffectiveDate(null);
      const params: any = { page: 1, per_page: 50, start_date: dates.start_date, end_date: dates.end_date };
      if (selectedUserId) params.user_id = selectedUserId;
      const res = await apiClient.get('/screenshots', { params });
      return res.data.items || res.data.screenshots || res.data || [];
    };

    fetchWithFallback()
      .then((raw) => {
        const baseUrl = apiClient.defaults.baseURL || '';
        const userMap = new Map(users.map((u) => [u.id, u.full_name]));
        const deviceMap = new Map(devices.map((d) => [d.id, d.hostname]));
        const mapped: ScreenshotItem[] = (Array.isArray(raw) ? raw : []).map((s: any) => {
          const imgUrl = s.download_url
            ? (s.download_url.startsWith('http') ? s.download_url : baseUrl + s.download_url)
            : '';
          return {
            id: s.id || '',
            imageUrl: imgUrl,
            thumbnailUrl: imgUrl,
            userName: s.user_name || s.userName || (s.user_id && userMap.get(s.user_id)) || 'Employee',
            deviceName: s.device_name || s.deviceName || (s.device_id && deviceMap.get(s.device_id)) || 'Device',
            capturedAt: s.captured_at ? new Date(String(s.captured_at).endsWith('Z') || String(s.captured_at).includes('+') ? s.captured_at : s.captured_at + 'Z').toLocaleString() : '',
            applicationName: s.application_name || s.applicationName,
          };
        });
        setScreenshots(mapped);
      })
      .catch(() => setError('Unable to load screenshots'))
      .finally(() => setLoading(false));
  }, [period, selectedUserId, users, devices]);

  const filteredScreenshots = useMemo(() => {
    if (!search) return screenshots;
    const lower = search.toLowerCase();
    return screenshots.filter(
      (s) =>
        s.userName.toLowerCase().includes(lower) ||
        s.deviceName.toLowerCase().includes(lower) ||
        (s.applicationName ?? '').toLowerCase().includes(lower)
    );
  }, [search, screenshots]);

  const handleScreenshotClick = useCallback(
    (screenshot: ScreenshotItem) => {
      const index = filteredScreenshots.findIndex((s) => s.id === screenshot.id);
      if (index !== -1) setLightboxIndex(index);
    },
    [filteredScreenshots]
  );

  const lightboxData = useMemo(
    () =>
      filteredScreenshots.map((s) => ({
        id: s.id,
        imageUrl: s.imageUrl,
        userName: s.userName,
        deviceName: s.deviceName,
        capturedAt: s.capturedAt,
        applicationName: s.applicationName,
      })),
    [filteredScreenshots]
  );

  const today = new Date().toISOString().split('T')[0]!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Camera className="h-6 w-6" />
            Screenshot Monitoring
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View captured screenshots from monitored devices
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* User filter dropdown */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            aria-label="Filter by user"
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </select>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by user, device, or app..."
          className="w-72"
        />

        {/* Period filter */}
        <div className="flex flex-col gap-1">
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
          {period === 'daily' && effectiveDate && effectiveDate !== today && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400">
              Showing last active: {new Date(effectiveDate + 'T12:00:00').toLocaleDateString()}
            </span>
          )}
        </div>

        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filteredScreenshots.length} screenshots
        </span>
      </div>

      {/* Loading */}
      {loading && <LoadingSpinner message="Loading screenshots..." />}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && screenshots.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <Camera className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No screenshots captured yet
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Deploy the agent to start monitoring.
          </p>
        </div>
      )}

      {/* Gallery */}
      {!loading && !error && filteredScreenshots.length > 0 && (
        <ScreenshotGallery
          screenshots={filteredScreenshots}
          onScreenshotClick={handleScreenshotClick}
          pageSize={12}
          columns={3}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ScreenshotLightbox
          screenshots={lightboxData}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
