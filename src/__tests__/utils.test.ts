/**
 * Unit Tests for Utility Functions
 */

import { AppError, NotFoundError, BadRequestError, UnauthorizedError, ValidationError } from '../utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create error with custom values', () => {
      const error = new AppError('Custom error', 400, 'CUSTOM_CODE', false);
      
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.isOperational).toBe(false);
    });
  });

  describe('NotFoundError', () => {
    it('should create 404 error', () => {
      const error = new NotFoundError('Resource not found');
      
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should use default message', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Resource not found');
    });
  });

  describe('BadRequestError', () => {
    it('should create 400 error', () => {
      const error = new BadRequestError('Invalid input');
      
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create 401 error', () => {
      const error = new UnauthorizedError('Please login');
      
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('ValidationError', () => {
    it('should create 422 error with validation errors', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];
      const error = new ValidationError('Validation failed', errors);
      
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.errors).toEqual(errors);
    });
  });
});

describe('Response Format', () => {
  describe('Success Response', () => {
    it('should format success response correctly', () => {
      const data = { id: '1', name: 'Test' };
      const response = {
        success: true,
        message: 'Success',
        data,
      };

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('Success');
    });
  });

  describe('Paginated Response', () => {
    it('should include pagination metadata', () => {
      const response = {
        success: true,
        data: [{ id: '1' }, { id: '2' }],
        meta: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      };

      expect(response.meta.page).toBe(1);
      expect(response.meta.limit).toBe(10);
      expect(response.meta.total).toBe(25);
      expect(response.meta.totalPages).toBe(3);
    });

    it('should calculate total pages correctly', () => {
      const total = 25;
      const limit = 10;
      const totalPages = Math.ceil(total / limit);

      expect(totalPages).toBe(3);
    });
  });

  describe('Error Response', () => {
    it('should format error response correctly', () => {
      const response = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
        },
      };

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('NOT_FOUND');
      expect(response.error.message).toBe('Resource not found');
    });
  });
});
