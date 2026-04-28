/** Screenshots API: list, get, delete endpoints. */

import type {
  DateRangeParams,
  ScreenshotGalleryResponse,
  ScreenshotResponse,
} from "@/types/api";
import { apiClient } from "@/api/client";
import { API_ENDPOINTS } from "@/config/constants";

export interface ListScreenshotsParams extends DateRangeParams {
  user_id?: string;
  device_id?: string;
  page?: number;
  per_page?: number;
}

export async function listScreenshots(
  params: ListScreenshotsParams,
): Promise<ScreenshotGalleryResponse> {
  const response = await apiClient.get<ScreenshotGalleryResponse>(
    API_ENDPOINTS.SCREENSHOTS.LIST,
    { params },
  );
  return response.data;
}

export async function getScreenshot(id: string): Promise<ScreenshotResponse> {
  const response = await apiClient.get<ScreenshotResponse>(
    API_ENDPOINTS.SCREENSHOTS.DETAIL(id),
  );
  return response.data;
}

export async function deleteScreenshot(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.SCREENSHOTS.DELETE(id));
}
