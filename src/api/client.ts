/** Axios instance with JWT interceptors and auto-refresh logic. */

import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { TOKEN_STORAGE_KEYS } from "@/config/constants";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://rx-timechamp-be.onrender.com/api/v1";

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

function processQueue(error: unknown, token: string | null): void {
  for (const request of failedQueue) {
    if (error) {
      request.reject(error);
    } else if (token) {
      request.resolve(token);
    }
  }
  failedQueue = [];
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<AxiosResponse> => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isLoginRequest = originalRequest.url?.includes("/auth/login");
    const isRefreshRequest = originalRequest.url?.includes("/auth/refresh");
    const isMeRequest = originalRequest.url?.includes("/auth/me");

    // Don't intercept non-401, login, refresh, or /me requests
    if (error.response?.status !== 401 || isLoginRequest || isRefreshRequest || isMeRequest) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    const refreshToken = localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      isRefreshing = false;
      processQueue(error, null);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      const response = await axios.post<{ access_token: string; refresh_token: string }>(
        `${BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken },
      );

      const { access_token, refresh_token: newRefreshToken } = response.data;

      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, access_token);
      localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

      isRefreshing = false;
      processQueue(null, access_token);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
      }

      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError, null);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    }
  },
);
