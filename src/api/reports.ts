/** Reports API: generate, get, list, and schedule endpoints. */

import type {
  PaginatedResponse,
  ReportRequest,
  ReportResponse,
  ReportScheduleRequest,
} from "@/types/api";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/config/constants";

export async function generateReport(
  request: ReportRequest,
): Promise<ReportResponse> {
  const response = await apiClient.post<ReportResponse>(
    API_ENDPOINTS.REPORTS.GENERATE,
    request,
  );
  return response.data;
}

export async function getReport(id: string): Promise<ReportResponse> {
  const response = await apiClient.get<ReportResponse>(
    API_ENDPOINTS.REPORTS.DETAIL(id),
  );
  return response.data;
}

export interface ListReportsParams {
  page?: number;
  per_page?: number;
  status?: string;
}

export async function listReports(
  params?: ListReportsParams,
): Promise<PaginatedResponse<ReportResponse>> {
  const response = await apiClient.get<PaginatedResponse<ReportResponse>>(
    API_ENDPOINTS.REPORTS.LIST,
    { params },
  );
  return response.data;
}

export async function scheduleReport(
  request: ReportScheduleRequest,
): Promise<ReportResponse> {
  const response = await apiClient.post<ReportResponse>(
    API_ENDPOINTS.REPORTS.SCHEDULE,
    request,
  );
  return response.data;
}
