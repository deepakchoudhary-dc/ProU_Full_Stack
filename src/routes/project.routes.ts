/**
 * Project Routes
 */

import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { 
  validate, 
  createProjectValidation, 
  updateProjectValidation,
  idParamValidation,
  paginationValidation 
} from '../middleware/validation';

const router = Router();

// All project routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/projects
 * @desc    Get all projects for current user
 * @access  Private
 */
router.get(
  '/',
  validate(paginationValidation),
  projectController.getProjects
);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post(
  '/',
  validate(createProjectValidation),
  projectController.createProject
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(idParamValidation),
  projectController.getProject
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private
 */
router.put(
  '/:id',
  validate(updateProjectValidation),
  projectController.updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private
 */
router.delete(
  '/:id',
  validate(idParamValidation),
  projectController.deleteProject
);

/**
 * @route   GET /api/projects/:id/stats
 * @desc    Get project statistics
 * @access  Private
 */
router.get(
  '/:id/stats',
  validate(idParamValidation),
  projectController.getProjectStats
);

export default router;
