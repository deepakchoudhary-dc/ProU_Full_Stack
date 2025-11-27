/**
 * User Controller
 * Handles user management operations
 */

import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, paginatedResponse } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import config from '../config';

/**
 * @route   GET /api/users
 * @desc    Get all users (for task assignment, etc.)
 * @access  Private
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(
    parseInt(req.query.limit as string) || config.pagination.defaultLimit,
    config.pagination.maxLimit
  );
  const search = req.query.search as string;

  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            tasks: true,
            assignedTasks: true,
          },
        },
      },
      orderBy: { firstName: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return paginatedResponse(res, users, page, limit, total);
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          projects: true,
          tasks: true,
          assignedTasks: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return successResponse(res, user);
});

/**
 * @route   GET /api/users/search
 * @desc    Search users by email or name (for autocomplete)
 * @access  Private
 */
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!query || query.length < 2) {
    return successResponse(res, []);
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query } },
        { firstName: { contains: query } },
        { lastName: { contains: query } },
      ],
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
    },
    take: limit,
    orderBy: { firstName: 'asc' },
  });

  return successResponse(res, users);
});
