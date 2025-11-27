/**
 * Project Controller
 * Handles CRUD operations for projects
 */

import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, createdResponse, paginatedResponse, noContentResponse } from '../utils/response';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import config from '../config';

/**
 * @route   GET /api/projects
 * @desc    Get all projects for current user
 * @access  Private
 */
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(
    parseInt(req.query.limit as string) || config.pagination.defaultLimit,
    config.pagination.maxLimit
  );
  const status = req.query.status as string;
  const search = req.query.search as string;

  // Build where clause
  const where: any = {
    ownerId: req.user!.id,
  };

  if (status && ['ACTIVE', 'ARCHIVED', 'COMPLETED'].includes(status)) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  // Get projects with count
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  // Calculate task stats for each project
  const projectsWithStats = projects.map(project => {
    const taskStats = {
      total: project._count.tasks,
      completed: project.tasks.filter(t => t.status === 'COMPLETED').length,
      inProgress: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
      todo: project.tasks.filter(t => t.status === 'TODO').length,
    };

    const { tasks, ...projectData } = project;
    return {
      ...projectData,
      taskStats,
    };
  });

  return paginatedResponse(res, projectsWithStats, page, limit, total);
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private
 */
export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      tasks: {
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          tags: true,
        },
        orderBy: [
          { status: 'asc' },
          { priority: 'desc' },
          { order: 'asc' },
        ],
      },
      _count: {
        select: { tasks: true },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check ownership
  if (project.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new ForbiddenError('You do not have access to this project');
  }

  return successResponse(res, project);
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, color, icon } = req.body;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      color,
      icon,
      ownerId: req.user!.id,
    },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return createdResponse(res, project, 'Project created successfully');
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private
 */
export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, color, icon, status } = req.body;

  // Check if project exists and user has access
  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Project not found');
  }

  if (existing.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new ForbiddenError('You do not have permission to update this project');
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(color && { color }),
      ...(icon && { icon }),
      ...(status && { status }),
    },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });

  return successResponse(res, project, 'Project updated successfully');
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private
 */
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check if project exists and user has access
  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Project not found');
  }

  if (existing.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new ForbiddenError('You do not have permission to delete this project');
  }

  await prisma.project.delete({
    where: { id },
  });

  return noContentResponse(res);
});

/**
 * @route   GET /api/projects/:id/stats
 * @desc    Get project statistics
 * @access  Private
 */
export const getProjectStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        select: {
          status: true,
          priority: true,
          createdAt: true,
          completedAt: true,
        },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new ForbiddenError('You do not have access to this project');
  }

  const stats = {
    total: project.tasks.length,
    byStatus: {
      todo: project.tasks.filter(t => t.status === 'TODO').length,
      inProgress: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
      inReview: project.tasks.filter(t => t.status === 'IN_REVIEW').length,
      completed: project.tasks.filter(t => t.status === 'COMPLETED').length,
    },
    byPriority: {
      low: project.tasks.filter(t => t.priority === 'LOW').length,
      medium: project.tasks.filter(t => t.priority === 'MEDIUM').length,
      high: project.tasks.filter(t => t.priority === 'HIGH').length,
      urgent: project.tasks.filter(t => t.priority === 'URGENT').length,
    },
    completionRate: project.tasks.length > 0
      ? Math.round((project.tasks.filter(t => t.status === 'COMPLETED').length / project.tasks.length) * 100)
      : 0,
  };

  return successResponse(res, stats);
});
