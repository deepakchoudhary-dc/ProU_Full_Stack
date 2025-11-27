/**
 * TypeScript Types for the Application
 */

// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects: number;
    tasks: number;
    assignedTasks: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================
// PROJECT TYPES
// ============================================

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  ownerId: string;
  owner?: User;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
  };
  taskStats?: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
  };
  tasks?: Task[];
}

// ============================================
// TASK TYPES
// ============================================

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  completedAt?: string;
  order: number;
  projectId: string;
  project?: {
    id: string;
    name: string;
    color: string;
  };
  creatorId: string;
  creator?: User;
  assigneeId?: string;
  assignee?: User;
  tags?: Tag[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
  };
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string;
  assigneeId?: string;
  tagIds?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string | null;
  assigneeId?: string | null;
  tagIds?: string[];
  order?: number;
}

// ============================================
// COMMENT TYPES
// ============================================

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// TAG TYPES
// ============================================

export interface Tag {
  id: string;
  name: string;
  color: string;
  _count?: {
    tasks: number;
  };
}

// ============================================
// STATS TYPES
// ============================================

export interface DashboardStats {
  tasksByStatus: {
    todo: number;
    inProgress: number;
    inReview: number;
    completed: number;
  };
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  totalTasks: number;
  completedTasks: number;
  totalProjects: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  completionRate: number;
  completedThisWeek: number;
  upcomingTasks?: Task[];
}

export interface RecentActivity {
  recentTasks: Task[];
  recentComments: Comment[];
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    message: string;
    errors?: Array<{ field: string; message: string }>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  projectId: string;
  priority: Priority;
  dueDate?: string;
  assigneeId?: string;
  tagIds?: string[];
}
