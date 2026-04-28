/** Dashboard API: overview, user dashboard, and trends endpoints. */

import type {
  DashboardOverviewResponse,
  DateRangeParams,
  TrendsResponse,
  UserDashboardResponse,
} from "@/types/api";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/config/constants";

export interface GetOverviewParams extends DateRangeParams {}

export async function getOverview(
  params?: GetOverviewParams,
): Promise<DashboardOverviewResponse> {
  const response = await apiClient.get<DashboardOverviewResponse>(
    API_ENDPOINTS.DASHBOARD.OVERVIEW,
    { params },
  );
  return response.data;
}

export interface GetUserDashboardParams extends DateRangeParams {}

export async function getUserDashboard(
  userId: string,
  params?: GetUserDashboardParams,
): Promise<UserDashboardResponse> {
  const response = await apiClient.get<UserDashboardResponse>(
    API_ENDPOINTS.DASHBOARD.USER(userId),
    { params },
  );
  return response.data;
}

export interface GetTrendsParams extends DateRangeParams {
  user_id?: string;
}

export async function getTrends(
  params?: GetTrendsParams,
): Promise<TrendsResponse> {
  const response = await apiClient.get<TrendsResponse>(
    API_ENDPOINTS.DASHBOARD.TRENDS,
    { params },
  );
  return response.data;
}
