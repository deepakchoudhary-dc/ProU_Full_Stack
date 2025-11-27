/**
 * Stats Controller
 * Provides dashboard statistics and analytics
 */

import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';

/**
 * @route   GET /api/stats/dashboard
 * @desc    Get dashboard statistics for current user
 * @access  Private
 */
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // Get user's projects
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });

  const projectIds = projects.map(p => p.id);

  // Get all tasks the user has access to
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { assigneeId: userId },
        { projectId: { in: projectIds } },
      ],
    },
    select: {
      status: true,
      priority: true,
      dueDate: true,
      completedAt: true,
      createdAt: true,
    },
  });

  // Calculate stats
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const stats = {
    // Task counts by status
    tasksByStatus: {
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
    },
    
    // Task counts by priority
    tasksByPriority: {
      low: tasks.filter(t => t.priority === 'LOW').length,
      medium: tasks.filter(t => t.priority === 'MEDIUM').length,
      high: tasks.filter(t => t.priority === 'HIGH').length,
      urgent: tasks.filter(t => t.priority === 'URGENT').length,
    },

    // Summary stats
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
    totalProjects: projects.length,
    
    // Due date stats
    overdue: tasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < startOfToday && 
      t.status !== 'COMPLETED'
    ).length,
    dueToday: tasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate).toDateString() === now.toDateString() &&
      t.status !== 'COMPLETED'
    ).length,
    dueThisWeek: tasks.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false;
      const dueDate = new Date(t.dueDate);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      return dueDate >= startOfToday && dueDate < endOfWeek;
    }).length,

    // Completion rate
    completionRate: tasks.length > 0
      ? Math.round((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100)
      : 0,

    // Recently completed (this week)
    completedThisWeek: tasks.filter(t => 
      t.completedAt && 
      new Date(t.completedAt) >= startOfWeek
    ).length,
  };

  return successResponse(res, stats);
});

/**
 * @route   GET /api/stats/activity
 * @desc    Get recent activity feed
 * @access  Private
 */
export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const limit = parseInt(req.query.limit as string) || 10;

  // Get user's projects
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });

  const projectIds = projects.map(p => p.id);

  // Get recent tasks
  const recentTasks = await prisma.task.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { assigneeId: userId },
        { projectId: { in: projectIds } },
      ],
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          color: true,
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
    },
  });

  // Get recent comments
  const recentComments = await prisma.comment.findMany({
    where: {
      task: {
        OR: [
          { creatorId: userId },
          { assigneeId: userId },
          { projectId: { in: projectIds } },
        ],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return successResponse(res, {
    recentTasks,
    recentComments,
  });
});

/**
 * @route   GET /api/stats/productivity
 * @desc    Get productivity metrics (tasks completed over time)
 * @access  Private
 */
export const getProductivityStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const days = parseInt(req.query.days as string) || 30;

  // Get user's projects
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });

  const projectIds = projects.map(p => p.id);

  // Get completed tasks in the last N days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const completedTasks = await prisma.task.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { assigneeId: userId },
        { projectId: { in: projectIds } },
      ],
      completedAt: {
        gte: startDate,
      },
    },
    select: {
      completedAt: true,
    },
    orderBy: { completedAt: 'asc' },
  });

  // Group by date
  const tasksByDate: Record<string, number> = {};
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    tasksByDate[dateKey] = 0;
  }

  completedTasks.forEach(task => {
    if (task.completedAt) {
      const dateKey = task.completedAt.toISOString().split('T')[0];
      if (tasksByDate[dateKey] !== undefined) {
        tasksByDate[dateKey]++;
      }
    }
  });

  // Convert to array format
  const productivity = Object.entries(tasksByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return successResponse(res, {
    productivity,
    totalCompleted: completedTasks.length,
    averagePerDay: completedTasks.length / days,
  });
});
