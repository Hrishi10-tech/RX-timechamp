import { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Monitor, Clock, Save } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

type SettingsTab = 'general' | 'notifications' | 'monitoring' | 'security';

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabConfig[] = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'monitoring', label: 'Monitoring', icon: Monitor },
  { id: 'security', label: 'Security', icon: Shield },
];

interface SettingsState {
  orgName: string;
  timezone: string;
  dateFormat: string;
  emailAlerts: boolean;
  browserNotif: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  agentOffline: boolean;
  screenshotInterval: string;
  appTracking: boolean;
  urlTracking: boolean;
  keystrokeAnalytics: boolean;
  twoFactor: boolean;
  sessionTimeout: string;
  minPasswordLength: number;
}

const defaultSettings: SettingsState = {
  orgName: '',
  timezone: 'UTC+0',
  dateFormat: 'YYYY-MM-DD',
  emailAlerts: false,
  browserNotif: false,
  dailyDigest: false,
  weeklyReport: false,
  agentOffline: false,
  screenshotInterval: '5',
  appTracking: false,
  urlTracking: false,
  keystrokeAnalytics: false,
  twoFactor: false,
  sessionTimeout: '30',
  minPasswordLength: 8,
};

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get('/dashboard/overview')
      .then((res) => {
        const data = res.data;
        setSettings((prev) => ({
          ...prev,
          orgName: data.org_name || data.orgName || data.organization_name || '',
          timezone: data.timezone || prev.timezone,
          dateFormat: data.date_format || data.dateFormat || prev.dateFormat,
        }));
      })
      .catch(() => {
        // Backend may not be running - use defaults
      })
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = useCallback(<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      await apiClient.post('/settings', {
        org_name: settings.orgName,
        timezone: settings.timezone,
        date_format: settings.dateFormat,
        notifications: {
          email_alerts: settings.emailAlerts,
          browser_notifications: settings.browserNotif,
          daily_digest: settings.dailyDigest,
          weekly_report: settings.weeklyReport,
          agent_offline: settings.agentOffline,
        },
        monitoring: {
          screenshot_interval: parseInt(settings.screenshotInterval, 10),
          app_tracking: settings.appTracking,
          url_tracking: settings.urlTracking,
          keystroke_analytics: settings.keystrokeAnalytics,
        },
        security: {
          two_factor: settings.twoFactor,
          session_timeout: parseInt(settings.sessionTimeout, 10),
          min_password_length: settings.minPasswordLength,
        },
      });
      setSaveSuccess(true);
    } catch {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  if (loading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure your TrackMe dashboard preferences
          {user && (
            <span className="ml-2 text-gray-400">
              (Logged in as {user.email || user.full_name || 'Admin'})
            </span>
          )}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Save success */}
      {saveSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <p className="text-sm text-green-600 dark:text-green-400">Settings saved successfully.</p>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tab navigation */}
        <nav
          className="flex gap-1 lg:w-56 lg:shrink-0 lg:flex-col"
          aria-label="Settings tabs"
        >
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Tab content */}
        <div className="flex-1 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                General Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Organization Name
                  </label>
                  <input
                    id="org-name"
                    type="text"
                    value={settings.orgName}
                    onChange={(e) => updateSetting('orgName', e.target.value)}
                    placeholder="Enter your organization name"
                    className="mt-1 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="mt-1 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC+0">UTC</option>
                    <option value="UTC+5:30">IST (UTC+5:30)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="date-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date Format
                  </label>
                  <select
                    id="date-format"
                    value={settings.dateFormat}
                    onChange={(e) => updateSetting('dateFormat', e.target.value)}
                    className="mt-1 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {([
                  { key: 'emailAlerts' as const, label: 'Email alerts for critical events' },
                  { key: 'browserNotif' as const, label: 'Browser notifications' },
                  { key: 'dailyDigest' as const, label: 'Daily digest email' },
                  { key: 'weeklyReport' as const, label: 'Weekly summary report' },
                  { key: 'agentOffline' as const, label: 'Agent offline notifications' },
                ]).map((item) => (
                  <label key={item.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={(e) => updateSetting(item.key, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monitoring Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="screenshot-interval" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Clock className="h-4 w-4" />
                    Screenshot Interval
                  </label>
                  <select
                    id="screenshot-interval"
                    value={settings.screenshotInterval}
                    onChange={(e) => updateSetting('screenshotInterval', e.target.value)}
                    className="mt-1 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="1">Every 1 minute</option>
                    <option value="5">Every 5 minutes</option>
                    <option value="10">Every 10 minutes</option>
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                  </select>
                </div>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable app tracking
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.appTracking}
                    onChange={(e) => updateSetting('appTracking', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable URL tracking
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.urlTracking}
                    onChange={(e) => updateSetting('urlTracking', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Enable keystroke analytics
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.keystrokeAnalytics}
                    onChange={(e) => updateSetting('keystrokeAnalytics', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Security Settings
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Two-factor authentication
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Require 2FA for all admin accounts
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.twoFactor}
                    onChange={(e) => updateSetting('twoFactor', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <div>
                  <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Session Timeout
                  </label>
                  <select
                    id="session-timeout"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                    className="mt-1 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="480">8 hours</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="password-policy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Minimum Password Length
                  </label>
                  <input
                    id="password-policy"
                    type="number"
                    value={settings.minPasswordLength}
                    onChange={(e) => updateSetting('minPasswordLength', parseInt(e.target.value, 10) || 8)}
                    min={6}
                    max={32}
                    className="mt-1 w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-8 flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
