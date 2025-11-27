/**
 * Task Controller
 * Handles CRUD operations for tasks
 */

import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, createdResponse, paginatedResponse, noContentResponse } from '../utils/response';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import config from '../config';

/**
 * Check if user has access to a task
 */
const checkTaskAccess = async (taskId: string, userId: string, userRole: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: { ownerId: true },
      },
    },
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  const hasAccess = 
    task.creatorId === userId || 
    task.assigneeId === userId || 
    task.project.ownerId === userId ||
    userRole === 'ADMIN';

  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this task');
  }

  return task;
};

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (with filtering)
 * @access  Private
 */
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(
    parseInt(req.query.limit as string) || config.pagination.defaultLimit,
    config.pagination.maxLimit
  );
  
  // Filter options
  const projectId = req.query.projectId as string;
  const status = req.query.status as string;
  const priority = req.query.priority as string;
  const assigneeId = req.query.assigneeId as string;
  const search = req.query.search as string;
  const sortBy = req.query.sortBy as string || 'createdAt';
  const sortOrder = req.query.sortOrder as string || 'desc';

  // Build where clause - user can see tasks they created, are assigned to, or in their projects
  const where: any = {
    OR: [
      { creatorId: req.user!.id },
      { assigneeId: req.user!.id },
      { project: { ownerId: req.user!.id } },
    ],
  };

  if (projectId) {
    where.projectId = projectId;
  }

  if (status && ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'].includes(status)) {
    where.status = status;
  }

  if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
    where.priority = priority;
  }

  if (assigneeId) {
    where.assigneeId = assigneeId;
  }

  if (search) {
    where.AND = {
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
      ],
    };
  }

  // Build order by
  const validSortFields = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'];
  const orderBy: any = {};
  if (validSortFields.includes(sortBy)) {
    orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
  } else {
    orderBy.createdAt = 'desc';
  }

  // Get tasks with count
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        tags: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return paginatedResponse(res, tasks, page, limit, total);
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          color: true,
          ownerId: true,
        },
      },
      creator: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      assignee: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      tags: true,
      comments: {
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!task) {
    throw new NotFoundError('Task not found');
  }

  // Check access
  const hasAccess = 
    task.creatorId === req.user!.id || 
    task.assigneeId === req.user!.id || 
    task.project.ownerId === req.user!.id ||
    req.user!.role === 'ADMIN';

  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this task');
  }

  return successResponse(res, task);
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { 
    title, 
    description, 
    projectId, 
    priority, 
    status, 
    dueDate, 
    assigneeId,
    tagIds 
  } = req.body;

  // Verify project exists and user has access
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new ForbiddenError('You do not have permission to add tasks to this project');
  }

  // Get max order for the project
  const maxOrder = await prisma.task.aggregate({
    where: { projectId },
    _max: { order: true },
  });

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority || 'MEDIUM',
      status: status || 'TODO',
      dueDate: dueDate ? new Date(dueDate) : null,
      order: (maxOrder._max.order || 0) + 1,
      projectId,
      creatorId: req.user!.id,
      assigneeId: assigneeId || null,
      ...(tagIds && tagIds.length > 0 && {
        tags: {
          connect: tagIds.map((id: string) => ({ id })),
        },
      }),
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
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
  });

  return createdResponse(res, task, 'Task created successfully');
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    title, 
    description, 
    priority, 
    status, 
    dueDate, 
    assigneeId,
    tagIds,
    order 
  } = req.body;

  // Check access
  await checkTaskAccess(id, req.user!.id, req.user!.role);

  // Handle status change to completed
  const completedAt = status === 'COMPLETED' ? new Date() : 
                      status && status !== 'COMPLETED' ? null : undefined;

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(priority && { priority }),
      ...(status && { status }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      ...(order !== undefined && { order }),
      ...(completedAt !== undefined && { completedAt }),
      ...(tagIds && {
        tags: {
          set: tagIds.map((tagId: string) => ({ id: tagId })),
        },
      }),
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
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
  });

  return successResponse(res, task, 'Task updated successfully');
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Check access
  await checkTaskAccess(id, req.user!.id, req.user!.role);

  await prisma.task.delete({
    where: { id },
  });

  return noContentResponse(res);
});

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add a comment to a task
 * @access  Private
 */
export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  // Check access
  await checkTaskAccess(id, req.user!.id, req.user!.role);

  const comment = await prisma.comment.create({
    data: {
      content,
      taskId: id,
      authorId: req.user!.id,
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });

  return createdResponse(res, comment, 'Comment added successfully');
});

/**
 * @route   DELETE /api/tasks/:taskId/comments/:commentId
 * @desc    Delete a comment
 * @access  Private
 */
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const { taskId, commentId } = req.params;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      task: {
        include: {
          project: {
            select: { ownerId: true },
          },
        },
      },
    },
  });

  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  if (comment.taskId !== taskId) {
    throw new BadRequestError('Comment does not belong to this task');
  }

  // Check if user can delete (author, task creator, or project owner)
  const canDelete = 
    comment.authorId === req.user!.id ||
    comment.task.creatorId === req.user!.id ||
    comment.task.project.ownerId === req.user!.id ||
    req.user!.role === 'ADMIN';

  if (!canDelete) {
    throw new ForbiddenError('You do not have permission to delete this comment');
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return noContentResponse(res);
});

/**
 * @route   PATCH /api/tasks/reorder
 * @desc    Reorder tasks within a project
 * @access  Private
 */
export const reorderTasks = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, tasks } = req.body;

  if (!projectId || !tasks || !Array.isArray(tasks)) {
    throw new BadRequestError('Project ID and tasks array are required');
  }

  // Verify project access
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new ForbiddenError('You do not have permission to reorder tasks in this project');
  }

  // Update task orders in a transaction
  await prisma.$transaction(
    tasks.map((task: { id: string; order: number; status?: string }) =>
      prisma.task.update({
        where: { id: task.id },
        data: { 
          order: task.order,
          ...(task.status && { status: task.status as any }),
        },
      })
    )
  );

  return successResponse(res, null, 'Tasks reordered successfully');
});
