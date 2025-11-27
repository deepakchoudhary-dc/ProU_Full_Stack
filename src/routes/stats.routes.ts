/**
 * Statistics Routes
 */

import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All stats routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/stats/dashboard
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/dashboard', statsController.getDashboardStats);

/**
 * @route   GET /api/stats/activity
 * @desc    Get recent activity
 * @access  Private
 */
router.get('/activity', statsController.getRecentActivity);

/**
 * @route   GET /api/stats/productivity
 * @desc    Get productivity metrics
 * @access  Private
 */
router.get('/productivity', statsController.getProductivityStats);

export default router;
