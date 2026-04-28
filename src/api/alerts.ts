/** Alerts API: list, update, and create rule endpoints. */

import type {
  AlertResponse,
  AlertRuleRequest,
  AlertRuleResponse,
  PaginatedResponse,
} from "@/types/api";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/config/constants";

export interface ListAlertsParams {
  page?: number;
  per_page?: number;
  severity?: string;
  is_read?: boolean;
  user_id?: string;
}

export async function listAlerts(
  params?: ListAlertsParams,
): Promise<PaginatedResponse<AlertResponse>> {
  const response = await apiClient.get<PaginatedResponse<AlertResponse>>(
    API_ENDPOINTS.ALERTS.LIST,
    { params },
  );
  return response.data;
}

export interface UpdateAlertParams {
  is_read?: boolean;
}

export async function updateAlert(
  id: string,
  params: UpdateAlertParams,
): Promise<AlertResponse> {
  const response = await apiClient.patch<AlertResponse>(
    API_ENDPOINTS.ALERTS.UPDATE(id),
    params,
  );
  return response.data;
}

export async function createAlertRule(
  request: AlertRuleRequest,
): Promise<AlertRuleResponse> {
  const response = await apiClient.post<AlertRuleResponse>(
    API_ENDPOINTS.ALERTS.CREATE_RULE,
    request,
  );
  return response.data;
}

export async function listAlertRules(): Promise<AlertRuleResponse[]> {
  const response = await apiClient.get<AlertRuleResponse[]>(
    API_ENDPOINTS.ALERTS.RULES,
  );
  return response.data;
}
