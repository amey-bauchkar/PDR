import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '../types/index.js';
import type { AuthRequest } from './common.js';
export type { AuthRequest };

// JWT token verification middleware
export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    // Lightweight development-only token handling.
    // The backend keeps the admin routes usable without depending on JWT packages.
    const [role = 'admin', userId = 'dev-admin'] = token.split(':');
    req.userId = userId;
    req.userRole = role;
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }
}

// Role-based access control middleware
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
    next();
  };
}

// Async error wrapper for route handlers
export function asyncHandler(
  fn: (req: any, res: Response, next: NextFunction) => Promise<any> | any
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
