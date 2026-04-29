import { useState, useEffect, useCallback } from 'react';
import { FileBarChart, Plus, Download, Calendar, ChevronRight } from 'lucide-react';
import { DataTable } from '@/components/tables/DataTable';
import { Badge } from '@/components/common/Badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { apiClient } from '@/api/client';

type ReportStatus = 'ready' | 'generating' | 'scheduled' | 'failed' | 'processing' | 'completed';
type ReportType = 'productivity' | 'attendance' | 'activity' | 'security' | 'custom';

interface ReportRow {
  id: string;
  name: string;
  type: ReportType;
  status: ReportStatus;
  createdAt: string;
  dateRange: string;
  size: string;
  createdBy: string;
  [key: string]: unknown;
}

interface WizardStep {
  label: string;
  description: string;
}

const statusBadge: Record<string, 'success' | 'info' | 'warning' | 'critical'> = {
  ready: 'success',
  completed: 'success',
  generating: 'info',
  processing: 'info',
  scheduled: 'warning',
  failed: 'critical',
};

const columns = [
  { key: 'name', header: 'Report Name', sortable: true },
  {
    key: 'type',
    header: 'Type',
    sortable: true,
    render: (row: ReportRow) => (
      <Badge variant="neutral">
        {(row.type || 'custom').charAt(0).toUpperCase() + (row.type || 'custom').slice(1)}
      </Badge>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (row: ReportRow) => (
      <Badge variant={statusBadge[row.status] || 'info'} dot>
        {(row.status || 'unknown').charAt(0).toUpperCase() + (row.status || 'unknown').slice(1)}
      </Badge>
    ),
  },
  { key: 'dateRange', header: 'Date Range', sortable: false },
  { key: 'createdAt', header: 'Created', sortable: true },
  { key: 'size', header: 'Size', sortable: false },
  {
    key: 'actions',
    header: '',
    render: (row: ReportRow) =>
      (row.status === 'ready' || row.status === 'completed') ? (
        <button
          onClick={() => {
            const url = (row as any).download_url;
            if (url) {
              const baseUrl = 'https://rx-timechamp-be.onrender.com/api/v1';
              window.open(baseUrl + url, '_blank');
            }
          }}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
          aria-label={`Download ${row.name}`}
        >
          <Download className="h-3 w-3" />
          Download
        </button>
      ) : null,
  },
];

const wizardSteps: WizardStep[] = [
  { label: 'Report Type', description: 'Select the type of report' },
  { label: 'Date Range', description: 'Choose the date range' },
  { label: 'Options', description: 'Configure report options' },
  { label: 'Review', description: 'Review and generate' },
];

export function Reports() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [generating, setGenerating] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeBreakdowns, setIncludeBreakdowns] = useState(true);
  const [includeUserData, setIncludeUserData] = useState(false);
  const [exportFormat, setExportFormat] = useState('CSV');
  const [users, setUsers] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Fetch users for the dropdown
  useEffect(() => {
    apiClient.get('/admin/users').then((res) => {
      const data = res.data.items || res.data.users || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get('/reports')
      .then((res) => {
        const data = res.data.reports || res.data || [];
        const mapped = (Array.isArray(data) ? data : []).map((r: any) => ({
          id: r.id || r.report_id || '',
          name: r.name || `${(r.report_type || 'Report').charAt(0).toUpperCase() + (r.report_type || 'report').slice(1)} Report`,
          type: r.type || r.report_type || 'custom',
          status: r.status === 'completed' ? 'ready' : r.status || 'ready',
          createdAt: r.createdAt || r.created_at || '',
          dateRange: r.dateRange || '',
          size: r.size || (r.rows ? `${r.rows} rows` : '-'),
          createdBy: r.createdBy || r.requested_by || 'Admin',
          download_url: r.download_url || null,
        }));
        setReports(mapped);
      })
      .catch(() => {
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateReport = useCallback(() => {
    setShowWizard(true);
    setWizardStep(0);
    setSelectedType(null);
    setStartDate('');
    setEndDate('');
    setIncludeCharts(true);
    setIncludeBreakdowns(true);
    setIncludeUserData(false);
    setExportFormat('PDF');
  }, []);

  const handleCloseWizard = useCallback(() => {
    setShowWizard(false);
  }, []);

  const handleGenerateReport = useCallback(async () => {
    if (!selectedType) return;
    setGenerating(true);
    try {
      const formData = {
        type: selectedType,
        start_date: startDate,
        end_date: endDate,
        include_charts: includeCharts,
        include_breakdowns: includeBreakdowns,
        include_user_data: includeUserData,
        export_format: exportFormat,
        user_id: selectedUserId || undefined,
      };
      const genRes = await apiClient.post('/reports/generate', formData);
      // Auto-download the report if completed
      const reportId = genRes.data.report_id;
      if (genRes.data.status === 'completed' && reportId) {
        const detailRes = await apiClient.get(`/reports/${reportId}`);
        if (detailRes.data.download_url) {
          const baseUrl = apiClient.defaults.baseURL || '';
          window.open(baseUrl + detailRes.data.download_url, '_blank');
        }
      }
      // Refresh reports list
      const res = await apiClient.get('/reports');
      const data = res.data.reports || res.data || [];
      setReports(Array.isArray(data) ? data : []);
      setShowWizard(false);
    } catch {
      setError('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [selectedType, startDate, endDate, includeCharts, includeBreakdowns, includeUserData, exportFormat]);

  if (loading) {
    return <LoadingSpinner message="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <FileBarChart className="h-6 w-6" />
            Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Generate and manage reports
          </p>
        </div>
        <button
          onClick={handleCreateReport}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Report
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Create Report Wizard */}
      {showWizard && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-800 dark:bg-blue-900/10">
          {/* Steps indicator */}
          <div className="mb-6 flex items-center gap-2">
            {wizardSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    i === wizardStep
                      ? 'bg-blue-600 text-white'
                      : i < wizardStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {i < wizardStep ? '\u2713' : i + 1}
                </div>
                <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 md:inline">
                  {step.label}
                </span>
                {i < wizardSteps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="mb-6">
            {wizardStep === 0 && (
              <div>
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  Select Report Type
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(['productivity', 'attendance', 'activity', 'security', 'custom'] as ReportType[]).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`rounded-lg border p-4 text-left transition-colors ${
                          selectedType === type
                            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Generate a {type} report
                        </p>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
            {wizardStep === 1 && (
              <div>
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  Select Date Range
                </h3>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    aria-label="Start date"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    aria-label="End date"
                  />
                </div>
              </div>
            )}
            {wizardStep === 2 && (
              <div>
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  Report Options
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={includeCharts}
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                      className="rounded"
                    />
                    Include charts and visualizations
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={includeBreakdowns}
                      onChange={(e) => setIncludeBreakdowns(e.target.checked)}
                      className="rounded"
                    />
                    Include detailed breakdowns
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={includeUserData}
                      onChange={(e) => setIncludeUserData(e.target.checked)}
                      className="rounded"
                    />
                    Include individual user data
                  </label>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300">
                      Select User
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      aria-label="Select user"
                    >
                      <option value="">All Users</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.full_name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300">
                      Export format
                    </label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      aria-label="Export format"
                    >
                      <option>CSV</option>
                      <option>PDF</option>
                      <option>Excel</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {wizardStep === 3 && (
              <div>
                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  Review
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Report type: <strong>{selectedType}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  User: <strong>{selectedUserId ? users.find(u => u.id === selectedUserId)?.full_name || selectedUserId : 'All Users'}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Date range: <strong>{startDate || 'Not set'}</strong> to <strong>{endDate || 'Not set'}</strong>
                </p>
                {startDate && endDate && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Date range: <strong>{startDate}</strong> to <strong>{endDate}</strong>
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Format: <strong>{exportFormat}</strong>
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Click Generate to create your report.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={wizardStep === 0 ? handleCloseWizard : () => setWizardStep((s) => s - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {wizardStep === 0 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={
                wizardStep === wizardSteps.length - 1
                  ? handleGenerateReport
                  : () => setWizardStep((s) => s + 1)
              }
              disabled={generating || (wizardStep === 0 && !selectedType)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {generating
                ? 'Generating...'
                : wizardStep === wizardSteps.length - 1
                  ? 'Generate Report'
                  : 'Next'}
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && reports.length === 0 && !showWizard && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <FileBarChart className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No reports generated yet
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Create your first report.
          </p>
        </div>
      )}

      {/* Report library table */}
      {reports.length > 0 && (
        <section aria-label="Report library">
          <DataTable
            columns={columns}
            data={reports}
            keyExtractor={(row) => row.id}
            searchable
            searchKeys={['name', 'type', 'createdBy']}
            exportable
          />
        </section>
      )}
    </div>
  );
}
