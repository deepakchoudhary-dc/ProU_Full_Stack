/**
 * Validation Middleware
 * Input validation using express-validator
 */

import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Process validation results
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Run all validations
      await Promise.all(validations.map(validation => validation.run(req)));

      // Check for errors
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
          field: (err as any).path || (err as any).param,
          message: err.msg,
        }));
        
        return next(new ValidationError('Validation failed', formattedErrors));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// ============================================
// AUTH VALIDATORS
// ============================================

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ============================================
// PROJECT VALIDATORS
// ============================================

export const createProjectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color (e.g., #6366f1)'),
  body('icon')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Icon name cannot exceed 50 characters'),
];

export const updateProjectValidation = [
  param('id').isUUID().withMessage('Invalid project ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'ARCHIVED', 'COMPLETED'])
    .withMessage('Invalid project status'),
];

// ============================================
// TASK VALIDATORS
// ============================================

export const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Task title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('projectId')
    .isUUID()
    .withMessage('Valid project ID is required'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority level'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'])
    .withMessage('Invalid task status'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('assigneeId')
    .optional()
    .isUUID()
    .withMessage('Invalid assignee ID'),
  body('tagIds')
    .optional()
    .isArray()
    .withMessage('Tag IDs must be an array'),
];

export const updateTaskValidation = [
  param('id').isUUID().withMessage('Invalid task ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Task title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid priority level'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'])
    .withMessage('Invalid task status'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('assigneeId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Invalid assignee ID'),
];

// ============================================
// COMMON VALIDATORS
// ============================================

export const idParamValidation = [
  param('id').isUUID().withMessage('Invalid ID format'),
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const commentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
];
