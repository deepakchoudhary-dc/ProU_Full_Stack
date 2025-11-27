/**
 * Task Routes
 */

import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { 
  validate, 
  createTaskValidation, 
  updateTaskValidation,
  idParamValidation,
  paginationValidation,
  commentValidation
} from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

// All task routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (with filtering)
 * @access  Private
 */
router.get(
  '/',
  validate(paginationValidation),
  taskController.getTasks
);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post(
  '/',
  validate(createTaskValidation),
  taskController.createTask
);

/**
 * @route   PATCH /api/tasks/reorder
 * @desc    Reorder tasks within a project
 * @access  Private
 */
router.patch(
  '/reorder',
  validate([
    body('projectId').isUUID().withMessage('Valid project ID is required'),
    body('tasks').isArray().withMessage('Tasks array is required'),
  ]),
  taskController.reorderTasks
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(idParamValidation),
  taskController.getTask
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateTaskValidation),
  taskController.updateTask
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete(
  '/:id',
  validate(idParamValidation),
  taskController.deleteTask
);

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add a comment to a task
 * @access  Private
 */
router.post(
  '/:id/comments',
  validate([
    ...idParamValidation,
    ...commentValidation,
  ]),
  taskController.addComment
);

/**
 * @route   DELETE /api/tasks/:taskId/comments/:commentId
 * @desc    Delete a comment
 * @access  Private
 */
router.delete(
  '/:taskId/comments/:commentId',
  validate([
    param('taskId').isUUID().withMessage('Invalid task ID'),
    param('commentId').isUUID().withMessage('Invalid comment ID'),
  ]),
  taskController.deleteComment
);

export default router;
