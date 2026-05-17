import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// Simple request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
}

// Validation middleware factory
export function validateBody(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', error.errors);
    }
  };
}

// Validation middleware for query parameters
export function validateQuery(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error: any) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Query validation failed', error.errors);
    }
  };
}
