/**
 * Tag Controller
 * Handles CRUD operations for tags
 */

import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, createdResponse, noContentResponse } from '../utils/response';
import { NotFoundError, ConflictError } from '../utils/errors';

/**
 * @route   GET /api/tags
 * @desc    Get all tags
 * @access  Private
 */
export const getTags = asyncHandler(async (req: Request, res: Response) => {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return successResponse(res, tags);
});

/**
 * @route   GET /api/tags/:id
 * @desc    Get single tag
 * @access  Private
 */
export const getTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
        },
        take: 10,
      },
      _count: {
        select: { tasks: true },
      },
    },
  });

  if (!tag) {
    throw new NotFoundError('Tag not found');
  }

  return successResponse(res, tag);
});

/**
 * @route   POST /api/tags
 * @desc    Create a new tag
 * @access  Private
 */
export const createTag = asyncHandler(async (req: Request, res: Response) => {
  const { name, color } = req.body;

  // Check if tag with same name exists
  const existing = await prisma.tag.findUnique({
    where: { name },
  });

  if (existing) {
    throw new ConflictError('Tag with this name already exists');
  }

  const tag = await prisma.tag.create({
    data: {
      name,
      color: color || '#6366f1',
    },
  });

  return createdResponse(res, tag, 'Tag created successfully');
});

/**
 * @route   PUT /api/tags/:id
 * @desc    Update a tag
 * @access  Private
 */
export const updateTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, color } = req.body;

  // Check if tag exists
  const existing = await prisma.tag.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Tag not found');
  }

  // Check for name conflict
  if (name && name !== existing.name) {
    const nameExists = await prisma.tag.findUnique({
      where: { name },
    });

    if (nameExists) {
      throw new ConflictError('Tag with this name already exists');
    }
  }

  const tag = await prisma.tag.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(color && { color }),
    },
  });

  return successResponse(res, tag, 'Tag updated successfully');
});

/**
 * @route   DELETE /api/tags/:id
 * @desc    Delete a tag
 * @access  Private
 */
export const deleteTag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.tag.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Tag not found');
  }

  await prisma.tag.delete({
    where: { id },
  });

  return noContentResponse(res);
});
