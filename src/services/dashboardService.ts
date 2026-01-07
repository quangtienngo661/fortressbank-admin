import { apiClient } from "../config/api";
import type { ApiResponse, DashboardStatisticsRequest, DashboardStatisticsResponse } from "../types";

export const dashboardService = {
  /**
   * Get dashboard statistics for admin
   * @param request - Dashboard statistics request parameters
   * @returns Dashboard statistics response
   */
  getStatistics: async (request: DashboardStatisticsRequest = {}): Promise<DashboardStatisticsResponse> => {
    const params = new URLSearchParams();
    
    if (request.period) {
      params.append('period', request.period);
    }
    
    if (request.startDate) {
      params.append('startDate', request.startDate);
    }
    
    if (request.endDate) {
      params.append('endDate', request.endDate);
    }
    
    const queryString = params.toString();
    const url = `/transactions/admin/dashboard/statistics${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ApiResponse<DashboardStatisticsResponse>>(url);
    return response.data.data;
  },
};
