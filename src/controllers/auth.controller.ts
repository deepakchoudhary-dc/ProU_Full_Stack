/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import config from '../config';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, createdResponse } from '../utils/response';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';

/**
 * Generate JWT token
 */
const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { userId, email, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Remove password from user object
 */
const sanitizeUser = (user: any) => {
  const { password, ...sanitized } = user;
  return sanitized;
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, config.password.saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    },
  });

  // Generate token
  const token = generateToken(user.id, user.email, user.role);

  return createdResponse(res, {
    user: sanitizeUser(user),
    token,
  }, 'Registration successful');
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user.id, user.email, user.role);

  return successResponse(res, {
    user: sanitizeUser(user),
    token,
  }, 'Login successful');
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
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

  return successResponse(res, sanitizeUser(user));
});

/**
 * @route   PUT /api/auth/me
 * @desc    Update current user profile
 * @access  Private
 */
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, avatar } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(avatar && { avatar }),
    },
  });

  return successResponse(res, sanitizeUser(user), 'Profile updated successfully');
});

/**
 * @route   PUT /api/auth/password
 * @desc    Change password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, config.password.saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { password: hashedPassword },
  });

  return successResponse(res, null, 'Password changed successfully');
});
