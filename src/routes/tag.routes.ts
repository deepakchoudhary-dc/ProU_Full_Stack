/**
 * Tag Routes
 */

import { Router } from 'express';
import * as tagController from '../controllers/tag.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate, idParamValidation } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

// All tag routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/tags
 * @desc    Get all tags
 * @access  Private
 */
router.get('/', tagController.getTags);

/**
 * @route   POST /api/tags
 * @desc    Create a new tag
 * @access  Private
 */
router.post(
  '/',
  validate([
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Tag name is required')
      .isLength({ min: 1, max: 50 })
      .withMessage('Tag name must be between 1 and 50 characters'),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color must be a valid hex color'),
  ]),
  tagController.createTag
);

/**
 * @route   GET /api/tags/:id
 * @desc    Get tag by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(idParamValidation),
  tagController.getTag
);

/**
 * @route   PUT /api/tags/:id
 * @desc    Update a tag
 * @access  Private
 */
router.put(
  '/:id',
  validate([
    ...idParamValidation,
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Tag name must be between 1 and 50 characters'),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Color must be a valid hex color'),
  ]),
  tagController.updateTag
);

/**
 * @route   DELETE /api/tags/:id
 * @desc    Delete a tag
 * @access  Private
 */
router.delete(
  '/:id',
  validate(idParamValidation),
  tagController.deleteTag
);

export default router;
