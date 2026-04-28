/** Apps API: usage and top apps endpoints. */

import type {
  AppUsageResponse,
  DateRangeParams,
  PaginatedResponse,
  SortParams,
  TopAppsResponse,
} from "@/types/api";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/config/constants";

export interface GetUsageParams extends DateRangeParams, SortParams {
  user_id?: string;
  process_name?: string;
  page?: number;
  per_page?: number;
}

export async function getUsage(
  params: GetUsageParams,
): Promise<PaginatedResponse<AppUsageResponse>> {
  const response = await apiClient.get<PaginatedResponse<AppUsageResponse>>(
    API_ENDPOINTS.APPS.USAGE,
    { params },
  );
  return response.data;
}

export interface GetTopAppsParams extends DateRangeParams {
  user_id?: string;
  limit?: number;
}

export async function getTopApps(
  params: GetTopAppsParams,
): Promise<TopAppsResponse[]> {
  const response = await apiClient.get<TopAppsResponse[]>(
    API_ENDPOINTS.APPS.TOP,
    { params },
  );
  return response.data;
}
