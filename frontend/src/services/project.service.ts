/**
 * Projects API Service
 */

import api from './api';
import { ApiResponse, PaginatedResponse, Project, ProjectFormData } from '../types';

interface GetProjectsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const projectService = {
  /**
   * Get all projects
   */
  getProjects: async (params?: GetProjectsParams): Promise<{ data: Project[]; meta: any }> => {
    const response = await api.get<PaginatedResponse<Project>>('/projects', { params });
    return { data: response.data.data || [], meta: response.data.meta };
  },

  /**
   * Get single project by ID
   */
  getProject: async (id: string): Promise<Project> => {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data!;
  },

  /**
   * Create new project
   */
  createProject: async (data: ProjectFormData): Promise<Project> => {
    const response = await api.post<ApiResponse<Project>>('/projects', data);
    return response.data.data!;
  },

  /**
   * Update project
   */
  updateProject: async (id: string, data: Partial<ProjectFormData>): Promise<Project> => {
    const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data.data!;
  },

  /**
   * Delete project
   */
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  /**
   * Get project statistics
   */
  getProjectStats: async (id: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/projects/${id}/stats`);
    return response.data.data!;
  },
};
