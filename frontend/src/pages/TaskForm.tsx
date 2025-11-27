/**
 * Create/Edit Task Page
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Calendar,
  Tag,
  FolderKanban,
  AlertCircle,
  X,
} from 'lucide-react';
import { taskService } from '../services/task';
import { projectService } from '../services/project';
import { tagService } from '../services/tag';
import { Card, Button, Input, Badge } from '../components/ui';
import type { TaskStatus, Priority, Tag as TagType } from '../types';

interface TaskForm {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  projectId: string;
  tagIds: string[];
}

const TaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  const [error, setError] = useState('');

  const { data: taskData, isLoading: taskLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getTask(id!),
    enabled: isEditing,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects({}),
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagService.getTags(),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskForm>({
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      projectId: '',
      tagIds: [],
    },
  });

  const selectedTags = watch('tagIds') || [];

  useEffect(() => {
    if (taskData?.data) {
      const task = taskData.data;
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        projectId: task.projectId || '',
        tagIds: task.tags?.map((t: TagType) => t.id) || [],
      });
    }
  }, [taskData, reset]);

  const createMutation = useMutation({
    mutationFn: (data: TaskForm) => taskService.createTask({
      title: data.title,
      description: data.description || undefined,
      projectId: data.projectId,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate || undefined,
      tagIds: data.tagIds.length > 0 ? data.tagIds : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      navigate('/tasks');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to create task');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TaskForm) => taskService.updateTask(id!, {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate || undefined,
      tagIds: data.tagIds.length > 0 ? data.tagIds : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      navigate('/tasks');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to update task');
    },
  });

  const onSubmit = (data: TaskForm) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleTag = (tagId: string) => {
    const current = selectedTags;
    if (current.includes(tagId)) {
      setValue('tagIds', current.filter((id) => id !== tagId));
    } else {
      setValue('tagIds', [...current, tagId]);
    }
  };

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const priorityOptions: { value: Priority; label: string }[] = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ];

  if (taskLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Task' : 'Create Task'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEditing ? 'Update task details' : 'Add a new task to your list'}
          </p>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <Input
            label="Task Title"
            placeholder="Enter task title"
            error={errors.title?.message}
            {...register('title', { required: 'Title is required' })}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
              <textarea
                rows={4}
                placeholder="Add a description..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('description')}
              />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white"
                {...register('status')}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Priority
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white"
                {...register('priority')}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white"
                {...register('dueDate')}
              />
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Project <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className={`w-full rounded-lg border bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white ${
                  errors.projectId 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                }`}
                {...register('projectId', { required: 'Please select a project' })}
              >
                <option value="" className="text-gray-500 dark:text-gray-400">Select a project</option>
                {projectsData?.data?.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-500">{errors.projectId.message}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tagsData?.data?.map((tag: TagType) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'ring-2 ring-offset-2 ring-primary-500'
                      : ''
                  }`}
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                  }}
                >
                  <Tag className="h-3 w-3" />
                  {tag.name}
                  {selectedTags.includes(tag.id) && (
                    <X className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              icon={<Save className="h-4 w-4" />}
            >
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default TaskForm;
