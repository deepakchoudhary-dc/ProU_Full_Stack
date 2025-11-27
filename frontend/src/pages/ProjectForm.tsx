/**
 * Create/Edit Project Page
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Palette, AlertCircle } from 'lucide-react';
import { projectService } from '../services/project';
import { Card, Button, Input } from '../components/ui';
import type { ProjectStatus } from '../types';

interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
}

const ProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  const [error, setError] = useState('');

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id!),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE',
      color: '#6366f1',
    },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (projectData?.data) {
      const project = projectData.data;
      reset({
        name: project.name,
        description: project.description || '',
        status: project.status,
        color: project.color || '#6366f1',
      });
    }
  }, [projectData, reset]);

  const createMutation = useMutation({
    mutationFn: (data: ProjectFormData) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      navigate('/projects');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create project');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProjectFormData) => projectService.updateProject(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      navigate('/projects');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update project');
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const statusOptions: { value: ProjectStatus; label: string }[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  const colorOptions = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#84cc16', // Lime
    '#22c55e', // Green
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#6b7280', // Gray
  ];

  if (isLoading) {
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
            {isEditing ? 'Edit Project' : 'Create Project'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEditing ? 'Update project details' : 'Start a new project'}
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
          {/* Project Preview */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: selectedColor }}
            >
              {watch('name')?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {watch('name') || 'Project Name'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {watch('description') || 'Project description'}
              </p>
            </div>
          </div>

          {/* Name */}
          <Input
            label="Project Name"
            placeholder="Enter project name"
            error={errors.name?.message}
            {...register('name', { required: 'Project name is required' })}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe your project..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...register('description')}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Status
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm"
              {...register('status')}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Palette className="h-4 w-4 text-gray-400" />
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setValue('color', e.target.value)}
                className="h-8 w-8 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Custom color
              </span>
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
              {isEditing ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default ProjectForm;
