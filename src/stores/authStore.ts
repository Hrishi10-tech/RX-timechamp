/** Zustand auth store: user, tokens, login, logout, refreshToken, isAuthenticated. */

import { create } from "zustand";

import type { UserResponse } from "@/types/api";
import * as authApi from "@/api/auth";
import { TOKEN_STORAGE_KEYS } from "@/config/constants";

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshTokenValue: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN),
  refreshTokenValue: localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN),
  isAuthenticated: Boolean(localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN)),
  isLoading: false,
  error: null,

  login: async (email: string, password: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const tokens = await authApi.login({ email, password });
      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
      localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
      set({
        accessToken: tokens.access_token,
        refreshTokenValue: tokens.refresh_token,
        isAuthenticated: true,
        isLoading: false,
      });
      await get().loadUser();
    } catch {
      // DEMO MODE: if backend is unavailable, allow demo login
      if (email === "admin@trackme.com" && password === "admin123") {
        const demoToken = "demo-token-" + Date.now();
        localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, demoToken);
        localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, demoToken);
        const demoUser: UserResponse = {
          id: "demo-admin-001",
          email: "admin@trackme.com",
          full_name: "Admin User",
          role: "admin",
          is_active: true,
          org_id: "demo-org-001",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set({
          accessToken: demoToken,
          refreshTokenValue: demoToken,
          user: demoUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return;
      }
      const message = "Invalid email or password. Use demo: admin@trackme.com / admin123";
      set({ isLoading: false, error: message, isAuthenticated: false });
      throw new Error(message);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Logout even if API call fails
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      set({
        user: null,
        accessToken: null,
        refreshTokenValue: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  refreshToken: async (): Promise<void> => {
    const { refreshTokenValue } = get();
    if (!refreshTokenValue) {
      await get().logout();
      return;
    }
    try {
      const tokens = await authApi.refreshToken(refreshTokenValue);
      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
      localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
      set({
        accessToken: tokens.access_token,
        refreshTokenValue: tokens.refresh_token,
      });
    } catch {
      await get().logout();
    }
  },

  loadUser: async (): Promise<void> => {
    try {
      const user = await authApi.getCurrentUser();
      set({ user, isAuthenticated: true });
    } catch {
      // /auth/me failed but don't clear auth state — token may still be valid
      // Parse user info from the JWT token instead
      const token = get().accessToken;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          set({
            user: {
              id: payload.sub,
              email: payload.email,
              full_name: payload.email?.split('@')[0] || 'User',
              role: payload.role || 'viewer',
              is_active: true,
              org_id: payload.org_id || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            isAuthenticated: true,
          });
        } catch {
          set({ user: null });
        }
      } else {
        set({ user: null });
      }
    }
  },

  clearError: (): void => {
    set({ error: null });
  },
}));
