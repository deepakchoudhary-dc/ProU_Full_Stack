/**
 * Authentication API Service
 */

import api from './api';
import { ApiResponse, AuthResponse, User, LoginFormData, RegisterFormData } from '../types';

export const authService = {
  /**
   * Login user
   */
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/auth/me', data);
    return response.data.data!;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/password', { currentPassword, newPassword });
  },
};
