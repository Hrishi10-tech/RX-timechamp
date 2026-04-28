import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, X, Check, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '@/api/client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { TeamMembersCard } from '@/components/cards/TeamMembersCard';
import { ProductivityTrend } from '@/components/charts/ProductivityTrend';
import { EmployeeTimeline } from '@/components/charts/EmployeeTimeline';
import { TeamComparisonChart } from '@/components/charts/TeamComparisonChart';
import { DepartmentFilter } from '@/components/filters/DepartmentFilter';
import { SearchInput } from '@/components/common/SearchInput';

interface NewEmployee {
  full_name: string;
  email: string;
  password: string;
  role: 'viewer' | 'manager' | 'admin';
}

export function Dashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  // Add Employee modal state
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    full_name: '', email: '', password: '', role: 'viewer',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, agentsRes, overviewRes] = await Promise.all([
        apiClient.get('/admin/users', { params: { per_page: 100 } }),
        apiClient.get('/admin/agents').catch(() => ({ data: [] })),
        apiClient.get('/dashboard/overview').catch(() => ({ data: null })),
      ]);
      const users = usersRes.data.items || usersRes.data.users || [];
      const rawAgents = agentsRes.data?.items || agentsRes.data || [];
      const agents = Array.isArray(rawAgents) ? rawAgents : [];
      const overview = overviewRes.data;

      // Build user_name -> status mapping (match by name since API lacks user_id)
      const nameStatusMap = new Map<string, string>();
      for (const agent of agents) {
        const name = agent.user_name || '';
        const status = agent.status || 'offline';
        if (name && (status === 'online' || !nameStatusMap.has(name))) {
          nameStatusMap.set(name, status);
        }
      }

      // Fetch per-user productivity scores in parallel
      const userDashboards = await Promise.all(
        users.map((u: any) =>
          apiClient.get(`/dashboard/user/${u.id}`).catch(() => ({ data: null }))
        )
      );

      const enriched = users.map((u: any, i: number) => {
        const userDash = userDashboards[i]?.data;
        return {
          ...u,
          name: u.full_name || u.name || 'Unknown',
          status: nameStatusMap.get(u.full_name || u.name || '') || 'not_installed',
          department: u.department || u.role || 'general',
          productivityScore: userDash?.productivity_score != null
            ? Math.round(userDash.productivity_score)
            : 0,
        };
      });
      setMembers(enriched);

      const comparison = enriched.slice(0, 10).map((u: any) => ({
        name: (u.name || '').split(' ')[0] || 'User',
        productivity: u.productivityScore || 0,
        activeHours: overview?.avg_active_hours ?? 0,
      }));
      setComparisonData(comparison);
    } catch (err) {
      setError('Unable to load team data. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddEmployee = async () => {
    setAddLoading(true);
    setAddError(null);
    setAddSuccess(null);
    try {
      const res = await apiClient.post('/admin/users', newEmployee);
      setAddSuccess(`Employee "${res.data.full_name}" created successfully!\n(${res.data.email})`);
      setNewEmployee({ full_name: '', email: '', password: '', role: 'viewer' });
      fetchData(); // Refresh team list
      // Auto-close modal after 1.5s so user sees the success message
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { detail?: string } } };
      setAddError(axErr.response?.data?.detail ?? 'Failed to create employee');
    } finally {
      setAddLoading(false);
    }
  };

  const departments = useMemo(() => {
    const deptMap = new Map<string, number>();
    for (const m of members) {
      const dept = m.department || 'unknown';
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    }
    return Array.from(deptMap.entries()).map(([id, count]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      memberCount: count,
    }));
  }, [members]);

  const filteredMembers = useMemo(() => {
    let result = members;
    if (departmentId) {
      result = result.filter((m) => m.department === departmentId);
    }
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (m) =>
          (m.name || m.full_name || '').toLowerCase().includes(lower) ||
          (m.role || '').toLowerCase().includes(lower)
      );
    }
    return result;
  }, [members, departmentId, search]);

  if (loading) {
    return <LoadingSpinner message="Loading team data..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="rounded-lg bg-red-50 p-6 text-center text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Team Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor team productivity and activity
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No team members found. Add employees from the Admin Overview page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Team Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor team productivity and activity
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
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search members..."
            className="w-48"
          />
          <DepartmentFilter
            departments={departments}
            selectedId={departmentId}
            onChange={setDepartmentId}
          />
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Add New Employee
              </h2>
              <button onClick={() => { setShowAddEmployee(false); setAddError(null); setAddSuccess(null); }} className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              {addSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-300">
                  <Check className="h-4 w-4 flex-shrink-0" /> {addSuccess}
                </div>
              )}
              {addError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">{addError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" placeholder="John Doe" value={newEmployee.full_name} onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input type="email" placeholder="john@company.com" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 characters" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 pr-10 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select value={newEmployee.role} onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as NewEmployee['role'] })} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="viewer">Viewer (Employee)</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <button onClick={() => { setShowAddEmployee(false); setAddError(null); setAddSuccess(null); }} className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleAddEmployee} disabled={addLoading || !newEmployee.full_name || !newEmployee.email || !newEmployee.password} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {addLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <UserPlus className="h-4 w-4" />}
                {addLoading ? 'Creating...' : 'Create Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team members grid */}
      <section aria-label="Team members">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Team Members ({filteredMembers.length})
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMembers.map((member) => (
            <TeamMembersCard
              key={member.id}
              member={member}
              onClick={(id) => navigate(`/user/${id}/detail`)}
            />
          ))}
          {filteredMembers.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
              No team members match your filters
            </div>
          )}
        </div>
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-label="Productivity trend">
          <ProductivityTrend data={comparisonData.length > 0 ? comparisonData.map((d: any, i: number) => {
            const dt = new Date();
            dt.setDate(dt.getDate() - (comparisonData.length - 1 - i));
            return {
              date: dt.toISOString().split('T')[0],
              score: d.productivity,
              average: comparisonData.reduce((s: number, c: any) => s + c.productivity, 0) / comparisonData.length,
            };
          }) : []} />
        </section>
        <section aria-label="Team comparison">
          <TeamComparisonChart data={comparisonData.map((d: any) => ({
            team: d.name,
            productivity: d.productivity,
            activeHours: d.activeHours,
            idleHours: Math.max(0, 8 - d.activeHours),
          }))} />
        </section>
      </div>

      {/* Focus vs Idle Timeline */}
      <section aria-label="Employee activity timeline">
        <EmployeeTimeline data={comparisonData.length > 0 ? comparisonData.map((d: any) => ({
          employeeName: d.name,
          segments: [
            { start: '09:00', end: `${9 + Math.min(d.activeHours, 8)}:00`, type: 'active' as const },
            { start: `${9 + Math.min(d.activeHours, 8)}:00`, end: '17:00', type: 'idle' as const },
          ],
        })) : []} />
      </section>
    </div>
  );
}
