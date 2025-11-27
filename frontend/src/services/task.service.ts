/**
 * Tasks API Service
 */

import api from './api';
import { 
  ApiResponse, 
  PaginatedResponse, 
  Task, 
  CreateTaskInput, 
  UpdateTaskInput,
  Comment 
} from '../types';

interface GetTasksParams {
  page?: number;
  limit?: number;
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const taskService = {
  /**
   * Get all tasks
   */
  getTasks: async (params?: GetTasksParams): Promise<{ data: Task[]; meta: any }> => {
    const response = await api.get<PaginatedResponse<Task>>('/tasks', { params });
    return { data: response.data.data || [], meta: response.data.meta };
  },

  /**
   * Get single task by ID
   */
  getTask: async (id: string): Promise<Task> => {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data!;
  },

  /**
   * Create new task
   */
  createTask: async (data: CreateTaskInput): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>('/tasks', data);
    return response.data.data!;
  },

  /**
   * Update task
   */
  updateTask: async (id: string, data: UpdateTaskInput): Promise<Task> => {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data.data!;
  },

  /**
   * Delete task
   */
  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  /**
   * Add comment to task
   */
  addComment: async (taskId: string, content: string): Promise<Comment> => {
    const response = await api.post<ApiResponse<Comment>>(`/tasks/${taskId}/comments`, { content });
    return response.data.data!;
  },

  /**
   * Delete comment
   */
  deleteComment: async (taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  /**
   * Reorder tasks
   */
  reorderTasks: async (projectId: string, tasks: Array<{ id: string; order: number; status?: string }>): Promise<void> => {
    await api.patch('/tasks/reorder', { projectId, tasks });
  },
};
