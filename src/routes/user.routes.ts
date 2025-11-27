/**
 * User Routes
 */

import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate, idParamValidation, paginationValidation } from '../middleware/validation';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private
 */
router.get(
  '/',
  validate(paginationValidation),
  userController.getUsers
);

/**
 * @route   GET /api/users/search
 * @desc    Search users (for autocomplete)
 * @access  Private
 */
router.get('/search', userController.searchUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(idParamValidation),
  userController.getUser
);

export default router;
