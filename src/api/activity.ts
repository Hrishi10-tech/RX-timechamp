/** Activity API: sessions and summary endpoints. */

import type {
  ActivitySessionResponse,
  ActivitySummaryResponse,
  DateRangeParams,
  PaginatedResponse,
  SortParams,
} from "@/types/api";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/config/constants";

export interface GetSessionsParams extends DateRangeParams, SortParams {
  user_id?: string;
  device_id?: string;
  session_type?: string;
  page?: number;
  per_page?: number;
}

export async function getSessions(
  params: GetSessionsParams,
): Promise<PaginatedResponse<ActivitySessionResponse>> {
  const response = await apiClient.get<PaginatedResponse<ActivitySessionResponse>>(
    API_ENDPOINTS.ACTIVITY.SESSIONS,
    { params },
  );
  return response.data;
}

export interface GetSummaryParams extends DateRangeParams {
  user_id?: string;
}

export async function getSummary(
  params: GetSummaryParams,
): Promise<ActivitySummaryResponse> {
  const response = await apiClient.get<ActivitySummaryResponse>(
    API_ENDPOINTS.ACTIVITY.SUMMARY,
    { params },
  );
  return response.data;
}
