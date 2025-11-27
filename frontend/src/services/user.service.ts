/**
 * Users API Service
 */

import api from './api';
import { ApiResponse, PaginatedResponse, User } from '../types';

export const userService = {
  /**
   * Get all users
   */
  getUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ data: User[]; meta: any }> => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return { data: response.data.data || [], meta: response.data.meta };
  },

  /**
   * Search users
   */
  searchUsers: async (query: string, limit?: number): Promise<User[]> => {
    const response = await api.get<ApiResponse<User[]>>('/users/search', {
      params: { q: query, limit },
    });
    return response.data.data || [];
  },

  /**
   * Get single user
   */
  getUser: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  },
};
