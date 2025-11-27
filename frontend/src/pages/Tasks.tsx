/**
 * Tasks Page
 */

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  Calendar,
  FolderKanban,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Check,
} from 'lucide-react';
import { taskService } from '../services/task';
import { projectService } from '../services/project';
import { Card, Button, Input, Badge, Modal, TaskCardSkeleton } from '../components/ui';
import type { Task, TaskStatus, Priority } from '../types';

const Tasks = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>(
    (searchParams.get('status') as TaskStatus) || 'ALL'
  );
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>(
    (searchParams.get('priority') as Priority) || 'ALL'
  );
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; task?: Task }>({
    open: false,
  });

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', { 
      search, 
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
    }],
    queryFn: () => taskService.getTasks({ 
      search: search || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
    }),
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects({}),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setDeleteModal({ open: false });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskService.updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const statusOptions: { value: TaskStatus | 'ALL'; label: string; color: string }[] = [
    { value: 'ALL', label: 'All', color: 'bg-gray-500' },
    { value: 'TODO', label: 'To Do', color: 'bg-gray-500' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'IN_REVIEW', label: 'In Review', color: 'bg-yellow-500' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-green-500' },
  ];

  const priorityOptions: { value: Priority | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'danger' | 'warning' | 'info'> = {
      URGENT: 'danger',
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'info',
    };
    return variants[priority] || 'info';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
      TODO: 'default',
      IN_PROGRESS: 'primary',
      IN_REVIEW: 'warning',
      COMPLETED: 'success',
    };
    return variants[status] || 'default';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).setHours(0, 0, 0, 0) !== new Date().setHours(0, 0, 0, 0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {tasksData?.data?.total || 0} total tasks
          </p>
        </div>
        <Link to="/tasks/new">
          <Button icon={<Plus className="h-4 w-4" />}>
            New Task
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="h-5 w-5" />}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter className="h-4 w-4" />}
            >
              Filters
              {(statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded">
                  {[statusFilter !== 'ALL', priorityFilter !== 'ALL'].filter(Boolean).length}
                </span>
              )}
            </Button>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === option.value
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${option.color}`} />
                {option.label}
              </button>
            ))}
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as Priority | 'ALL')}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Tasks List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <TaskCardSkeleton key={i} />)}
        </div>
      ) : tasksData?.data?.length ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {tasksData.data.map((task: Task) => (
              <motion.div
                key={task.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, x: -20 }}
              >
                <Card hover padding="sm" className="group">
                  <div className="flex items-center gap-4">
                    {/* Status checkbox */}
                    <button
                      onClick={() => updateStatusMutation.mutate({
                        id: task.id,
                        status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED',
                      })}
                      className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.status === 'COMPLETED'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                      }`}
                    >
                      {task.status === 'COMPLETED' && <Check className="h-3 w-3" />}
                    </button>

                    {/* Task content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/tasks/${task.id}`}
                          className={`font-medium hover:text-primary-600 dark:hover:text-primary-400 ${
                            task.status === 'COMPLETED'
                              ? 'text-gray-400 line-through'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </Link>
                        <Badge variant={getPriorityBadge(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                        {task.status !== 'COMPLETED' && (
                          <Badge variant={getStatusBadge(task.status)} size="sm" dot>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {task.project && (
                          <Link
                            to={`/projects/${task.project.id}`}
                            className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            <FolderKanban className="h-3 w-3" />
                            {task.project.name}
                          </Link>
                        )}
                        {task.dueDate && (
                          <span
                            className={`flex items-center gap-1 ${
                              isOverdue(task.dueDate) && task.status !== 'COMPLETED'
                                ? 'text-red-500'
                                : ''
                            }`}
                          >
                            {isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? (
                              <AlertCircle className="h-3 w-3" />
                            ) : (
                              <Calendar className="h-3 w-3" />
                            )}
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            {task.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag.id}
                                className="px-1.5 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: `${tag.color}20`,
                                  color: tag.color,
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="text-gray-400">+{task.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/tasks/${task.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteModal({ open: true, task })}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <Card className="text-center py-12">
          <CheckSquare className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tasks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {search || statusFilter !== 'ALL' || priorityFilter !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first task'}
          </p>
          {!search && statusFilter === 'ALL' && priorityFilter === 'ALL' && (
            <Link to="/tasks/new">
              <Button icon={<Plus className="h-4 w-4" />}>
                Create Task
              </Button>
            </Link>
          )}
        </Card>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Task"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {deleteModal.task?.title}
            </span>
            ? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteModal({ open: false })}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteModal.task && deleteMutation.mutate(deleteModal.task.id)}
            >
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
