import { useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Monitor,
  Camera,
  Bell,
  HardDrive,
  FileBarChart,
  Settings,
  ChevronLeft,
  X,
  Activity,
} from 'lucide-react';
import { ROUTES } from '@/config/constants';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
}

const navItems: NavItem[] = [
  { label: 'Overview', path: ROUTES.DASHBOARD_OVERVIEW, icon: LayoutDashboard, section: 'Dashboard' },
  { label: 'Team Dashboard', path: '/team/all/dashboard', icon: Users, section: 'Team' },
  { label: 'User Detail', path: '/user/me/detail', icon: Activity, section: 'Individual' },
  { label: 'Screenshots', path: ROUTES.MONITORING_SCREENSHOTS, icon: Camera, section: 'Monitoring' },
  { label: 'Alerts', path: ROUTES.MONITORING_ALERTS, icon: Bell, section: 'Monitoring' },
  { label: 'Device Status', path: ROUTES.MONITORING_DEVICES, icon: HardDrive, section: 'Monitoring' },
  { label: 'Reports', path: ROUTES.REPORTING_REPORTS, icon: FileBarChart, section: 'Reporting' },
  { label: 'Settings', path: ROUTES.SETTINGS, icon: Settings },
];

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const location = useLocation();

  const getLinkClassName = useCallback(
    (isActive: boolean): string => {
      const base =
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors';
      const active =
        'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      const inactive =
        'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200';
      return `${base} ${isActive ? active : inactive} ${collapsed ? 'justify-center' : ''}`;
    },
    [collapsed]
  );

  const renderNavItems = () => {
    let lastSection = '';
    return navItems.map((item) => {
      const showSection = item.section && item.section !== lastSection && !collapsed;
      if (item.section) lastSection = item.section;

      return (
        <li key={item.path}>
          {showSection && (
            <span className="mb-1 mt-4 block px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {item.section}
            </span>
          )}
          <NavLink
            to={item.path}
            onClick={onCloseMobile}
            className={({ isActive }) => getLinkClassName(isActive)}
            aria-current={location.pathname === item.path ? 'page' : undefined}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        </li>
      );
    });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 ${
        collapsed ? 'w-16' : 'w-64'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      aria-label="Main navigation"
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Monitor className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              TrackMe
            </span>
          </div>
        )}
        {collapsed && (
          <Monitor className="mx-auto h-6 w-6 text-blue-600 dark:text-blue-400" />
        )}
        <button
          onClick={onCloseMobile}
          className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1" role="list">
          {renderNavItems()}
        </ul>
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden border-t border-gray-200 p-3 dark:border-gray-700 lg:block">
        <button
          onClick={() => {
            /* Parent handles toggle via Header */
          }}
          className="flex w-full items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </aside>
  );
}
