import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';

// Error handling middleware
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
      },
      timestamp: Date.now(),
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    },
    timestamp: Date.now(),
  });
}

// Not found handler
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
    },
    timestamp: Date.now(),
  });
}
