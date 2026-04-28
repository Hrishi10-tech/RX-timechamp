import { type ReactNode, Component, Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/config/constants";
import { MainLayout } from "@/components/layout/MainLayout";

const Login = lazy(() =>
  import("@/pages/auth/Login").then((m) => ({ default: m.Login }))
);
const Overview = lazy(() =>
  import("@/pages/admin/Overview").then((m) => ({ default: m.Overview }))
);
const TeamDashboard = lazy(() =>
  import("@/pages/team/Dashboard").then((m) => ({ default: m.Dashboard }))
);
const UserDetail = lazy(() =>
  import("@/pages/individual/UserDetail").then((m) => ({ default: m.UserDetail }))
);
const Screenshots = lazy(() =>
  import("@/pages/monitoring/Screenshots").then((m) => ({ default: m.Screenshots }))
);
const Alerts = lazy(() =>
  import("@/pages/monitoring/Alerts").then((m) => ({ default: m.Alerts }))
);
const DeviceStatus = lazy(() =>
  import("@/pages/monitoring/DeviceStatus").then((m) => ({ default: m.DeviceStatus }))
);
const Reports = lazy(() =>
  import("@/pages/reporting/Reports").then((m) => ({ default: m.Reports }))
);
const Settings = lazy(() =>
  import("@/pages/Settings").then((m) => ({ default: m.Settings }))
);
const Profile = lazy(() =>
  import("@/pages/Profile").then((m) => ({ default: m.Profile }))
);
const NotFound = lazy(() =>
  import("@/pages/NotFound").then((m) => ({ default: m.NotFound }))
);

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="mx-auto max-w-md space-y-4 p-8 text-center">
            <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
            <p className="text-muted-foreground">{this.state.error?.message}</p>
            <button
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = ROUTES.DASHBOARD_OVERVIEW;
              }}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingFallback(): ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps): ReactNode {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}

export function App(): ReactNode {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes - outside MainLayout */}
          <Route path={ROUTES.LOGIN} element={<Login />} />

          {/* Authenticated routes - wrapped in MainLayout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.DASHBOARD_OVERVIEW} element={<Overview />} />
            <Route path={ROUTES.TEAM_DASHBOARD} element={<TeamDashboard />} />
            <Route path={ROUTES.USER_DETAIL} element={<UserDetail />} />
            <Route path={ROUTES.MONITORING_SCREENSHOTS} element={<Screenshots />} />
            <Route path={ROUTES.MONITORING_ALERTS} element={<Alerts />} />
            <Route path={ROUTES.MONITORING_DEVICES} element={<DeviceStatus />} />
            <Route path={ROUTES.REPORTING_REPORTS} element={<Reports />} />
            <Route path={ROUTES.SETTINGS} element={<Settings />} />
            <Route path={ROUTES.PROFILE} element={<Profile />} />
          </Route>

          {/* Fallback routes - outside MainLayout */}
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD_OVERVIEW} replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
