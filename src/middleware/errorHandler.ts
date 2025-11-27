/**
 * Error Handler Middleware
 * Centralized error handling for all routes
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Global Error Handler
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let errors: any[] | undefined;

  // Log error for debugging (skip 404 route not found - too noisy)
  if (process.env.NODE_ENV === 'development') {
    const isRouteNotFound = err instanceof AppError && err.code === 'ROUTE_NOT_FOUND';
    if (!isRouteNotFound) {
      console.error('Error:', err);
    }
  }

  // Handle known application errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'APP_ERROR';

    if (err instanceof ValidationError) {
      errors = err.errors;
    }
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    switch (prismaError.code) {
      case 'P2002': // Unique constraint violation
        statusCode = 409;
        message = 'A record with this value already exists';
        code = 'UNIQUE_CONSTRAINT';
        break;
      case 'P2025': // Record not found
        statusCode = 404;
        message = 'Record not found';
        code = 'NOT_FOUND';
        break;
      case 'P2003': // Foreign key constraint
        statusCode = 400;
        message = 'Related record not found';
        code = 'FOREIGN_KEY_CONSTRAINT';
        break;
      default:
        statusCode = 400;
        message = 'Database error occurred';
        code = 'DATABASE_ERROR';
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
    code = 'TOKEN_EXPIRED';
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      errors,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
      }),
    },
  });
};
