/**
 * Tags API Service
 */

import api from './api';
import { ApiResponse, Tag } from '../types';

export const tagService = {
  /**
   * Get all tags
   */
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get<ApiResponse<Tag[]>>('/tags');
    return response.data.data || [];
  },

  /**
   * Create new tag
   */
  createTag: async (data: { name: string; color?: string }): Promise<Tag> => {
    const response = await api.post<ApiResponse<Tag>>('/tags', data);
    return response.data.data!;
  },

  /**
   * Update tag
   */
  updateTag: async (id: string, data: { name?: string; color?: string }): Promise<Tag> => {
    const response = await api.put<ApiResponse<Tag>>(`/tags/${id}`, data);
    return response.data.data!;
  },

  /**
   * Delete tag
   */
  deleteTag: async (id: string): Promise<void> => {
    await api.delete(`/tags/${id}`);
  },
};
