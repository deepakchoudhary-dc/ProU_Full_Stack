/**
 * Statistics API Service
 */

import api from './api';
import { ApiResponse, DashboardStats, RecentActivity } from '../types';

export const statsService = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/stats/dashboard');
    return response.data.data!;
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (limit?: number): Promise<RecentActivity> => {
    const response = await api.get<ApiResponse<RecentActivity>>('/stats/activity', {
      params: { limit },
    });
    return response.data.data!;
  },

  /**
   * Get productivity stats
   */
  getProductivityStats: async (days?: number): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/stats/productivity', {
      params: { days },
    });
    return response.data.data!;
  },
};
