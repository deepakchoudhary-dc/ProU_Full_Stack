/**
 * Projects Page
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  FolderKanban,
  Calendar,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckSquare,
} from 'lucide-react';
import { projectService } from '../services/project';
import { Card, Button, Input, Badge, Modal, ProjectCardSkeleton } from '../components/ui';
import type { Project, ProjectStatus } from '../types';

const Projects = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; project?: Project }>({
    open: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['projects', { search, status: statusFilter !== 'ALL' ? statusFilter : undefined }],
    queryFn: () => projectService.getProjects({ 
      search: search || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      setDeleteModal({ open: false });
    },
  });

  const statusOptions: { value: ProjectStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Projects' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'default' | 'info'> = {
      ACTIVE: 'success',
      ON_HOLD: 'warning',
      COMPLETED: 'info',
      ARCHIVED: 'default',
    };
    return variants[status] || 'default';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage and organize your projects
          </p>
        </div>
        <Link to="/projects/new">
          <Button icon={<Plus className="h-4 w-4" />}>
            New Project
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-5 w-5" />}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  statusFilter === option.value
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : data?.data?.length ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {data.data.map((project: Project) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card hover className="h-full flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: project.color || '#6366f1' }}
                      >
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div>
                        <Link
                          to={`/projects/${project.id}`}
                          className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                        >
                          {project.name}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {project._count?.tasks || 0} tasks
                        </p>
                      </div>
                    </div>
                    <div className="relative group">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <Link
                          to={`/projects/${project.id}/edit`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ open: true, project })}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {project.description && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(project.createdAt)}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <Badge variant={getStatusBadge(project.status)} dot>
                      {project.status.replace('_', ' ')}
                    </Badge>
                    {project._count?.tasks && project._count.tasks > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>
                          {project.taskStats?.completed || 0}/{project._count.tasks}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <Card className="text-center py-12">
          <FolderKanban className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {search
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first project'}
          </p>
          {!search && (
            <Link to="/projects/new">
              <Button icon={<Plus className="h-4 w-4" />}>
                Create Project
              </Button>
            </Link>
          )}
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {deleteModal.project?.name}
            </span>
            ? This action cannot be undone and all tasks will be deleted.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ open: false })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deleteModal.project && deleteMutation.mutate(deleteModal.project.id)}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
