import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbSegment {
  label: string;
  path: string;
}

const labelMap: Record<string, string> = {
  admin: 'Admin',
  team: 'Team',
  individual: 'Individual',
  monitoring: 'Monitoring',
  reporting: 'Reporting',
  overview: 'Overview',
  dashboard: 'Dashboard',
  detail: 'User Detail',
  screenshots: 'Screenshots',
  alerts: 'Alerts',
  'device-status': 'Device Status',
  reports: 'Reports',
  settings: 'Settings',
  profile: 'Profile',
  auth: 'Authentication',
  login: 'Login',
};

export function BreadcrumbNav() {
  const location = useLocation();

  const segments = useMemo((): BreadcrumbSegment[] => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((part, index) => ({
      label: labelMap[part] ?? part.charAt(0).toUpperCase() + part.slice(1),
      path: '/' + parts.slice(0, index + 1).join('/'),
    }));
  }, [location.pathname]);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="hidden md:block">
      <ol className="flex items-center gap-1 text-sm" role="list">
        <li>
          <Link
            to="/"
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          return (
            <li key={segment.path} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              {isLast ? (
                <span
                  className="font-medium text-gray-700 dark:text-gray-200"
                  aria-current="page"
                >
                  {segment.label}
                </span>
              ) : (
                <Link
                  to={segment.path}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  {segment.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
