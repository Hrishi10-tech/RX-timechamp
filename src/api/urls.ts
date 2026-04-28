/** URLs API: visits and top domains endpoints. */

import type {
  DateRangeParams,
  PaginatedResponse,
  SortParams,
  TopDomainsResponse,
  UrlVisitResponse,
} from "@/types/api";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/config/constants";

export interface GetVisitsParams extends DateRangeParams, SortParams {
  user_id?: string;
  domain?: string;
  page?: number;
  per_page?: number;
}

export async function getVisits(
  params: GetVisitsParams,
): Promise<PaginatedResponse<UrlVisitResponse>> {
  const response = await apiClient.get<PaginatedResponse<UrlVisitResponse>>(
    API_ENDPOINTS.URLS.VISITS,
    { params },
  );
  return response.data;
}

export interface GetTopDomainsParams extends DateRangeParams {
  user_id?: string;
  limit?: number;
}

export async function getTopDomains(
  params: GetTopDomainsParams,
): Promise<TopDomainsResponse[]> {
  const response = await apiClient.get<TopDomainsResponse[]>(
    API_ENDPOINTS.URLS.TOP_DOMAINS,
    { params },
  );
  return response.data;
}
