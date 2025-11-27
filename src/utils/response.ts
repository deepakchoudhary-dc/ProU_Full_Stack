/**
 * API Response Helpers
 * Standardized response format for all API endpoints
 */

import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  errors?: any[];
}

/**
 * Send success response
 */
export const successResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 */
export const createdResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response => {
  return successResponse(res, data, message, 201);
};

/**
 * Send no content response (204)
 */
export const noContentResponse = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Send paginated response
 */
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): Response => {
  return successResponse(
    res,
    data,
    message,
    200,
    {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  );
};
