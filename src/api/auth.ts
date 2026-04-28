/** Auth API: login, refresh, logout, current user. */

import type { LoginRequest, TokenResponse, UserResponse } from "@/types/api";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/config/constants";

export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    credentials,
  );
  return response.data;
}

export async function refreshToken(token: string): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>(
    API_ENDPOINTS.AUTH.REFRESH,
    { refresh_token: token },
  );
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
}

export async function getCurrentUser(): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>(API_ENDPOINTS.AUTH.ME);
  return response.data;
}
