import jwt from 'jsonwebtoken';
import { AppError } from '../types/index.js';
import { config } from '../config/env.js';
// JWT token verification middleware
export function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header');
        }
        const token = authHeader.substring(7);
        // Verify JWT token cryptographically
        const decoded = jwt.verify(token, config.jwt.secret);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    }
    catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new AppError(401, 'TOKEN_EXPIRED', 'Token has expired. Please login again.');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new AppError(401, 'INVALID_TOKEN', 'Invalid token. Please login again.');
        }
        throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
    }
}
// Role-based access control middleware
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions');
        }
        next();
    };
}
// Async error wrapper for route handlers
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=auth.js.map