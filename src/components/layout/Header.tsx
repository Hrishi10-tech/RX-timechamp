import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, LogOut, User, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { AlertPanel } from '@/components/layout/AlertPanel';
import { BreadcrumbNav } from '@/components/layout/BreadcrumbNav';
import { useAuthStore } from '@/stores/authStore';
import { ROUTES } from '@/config/constants';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleMobileSidebar: () => void;
  sidebarCollapsed: boolean;
}

export function Header({
  onToggleSidebar,
  onToggleMobileSidebar,
}: HeaderProps) {
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [alertPanelOpen, setAlertPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const unreadAlertCount = 3;

  const closeMenus = useCallback(() => {
    setUserMenuOpen(false);
    setAlertPanelOpen(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (alertRef.current && !alertRef.current.contains(target)) {
        setAlertPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenus();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeMenus]);

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800"
      role="banner"
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={onToggleSidebar}
          className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:block"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <BreadcrumbNav />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Search toggle */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle search"
          aria-expanded={searchOpen}
        >
          <Search className="h-5 w-5" />
        </button>

        {searchOpen && (
          <div className="absolute right-48 top-3 w-64">
            <input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              aria-label="Search"
              autoFocus
            />
          </div>
        )}

        <ThemeToggle />

        {/* Alerts */}
        <div ref={alertRef} className="relative">
          <button
            onClick={() => setAlertPanelOpen(!alertPanelOpen)}
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={`Alerts, ${unreadAlertCount} unread`}
            aria-expanded={alertPanelOpen}
            aria-haspopup="true"
          >
            <Bell className="h-5 w-5" />
            {unreadAlertCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadAlertCount}
              </span>
            )}
          </button>
          {alertPanelOpen && <AlertPanel onClose={() => setAlertPanelOpen(false)} />}
        </div>

        {/* User menu */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden md:inline">Admin</span>
            <ChevronDown className="hidden h-4 w-4 md:block" />
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
              role="menu"
              aria-label="User menu options"
            >
              <button
                onClick={() => {
                  navigate(ROUTES.PROFILE);
                  setUserMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-600" />
              <button
                onClick={async () => {
                  await useAuthStore.getState().logout();
                  navigate(ROUTES.LOGIN);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
