/** Auth hook wrapping authStore with convenience helpers. */

import { useCallback, useEffect } from "react";

import { useAuthStore } from "@/stores/authStore";
import type { UserResponse } from "@/types/api";

export interface UseAuthReturn {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isAdmin: boolean;
  isManager: boolean;
}

export function useAuth(): UseAuthReturn {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    loadUser,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      void loadUser();
    }
  }, [isAuthenticated, user, loadUser]);

  const handleLogin = useCallback(
    async (email: string, password: string): Promise<void> => {
      await login(email, password);
    },
    [login],
  );

  const handleLogout = useCallback(async (): Promise<void> => {
    await logout();
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    clearError,
    isAdmin: user?.role === "admin",
    isManager: user?.role === "manager",
  };
}
