import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <FileQuestion className="mb-6 h-24 w-24 text-gray-300 dark:text-gray-600" />
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
      <p className="mt-4 text-xl font-medium text-gray-600 dark:text-gray-400">
        Page not found
      </p>
      <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-500">
        The page you are looking for does not exist or has been moved. Please
        check the URL or navigate back to the dashboard.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
        <button
          onClick={() => navigate('/admin/overview')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </button>
      </div>
    </div>
  );
}

export default NotFound;
