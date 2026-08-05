import { AppError } from '../types/index.js';
// Simple request logging middleware
export function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
}
// Validation middleware factory
export function validateBody(schema) {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        }
        catch (error) {
            throw new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', error.errors);
        }
    };
}
// Validation middleware for query parameters
export function validateQuery(schema) {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.query);
            req.query = validated;
            next();
        }
        catch (error) {
            throw new AppError(400, 'VALIDATION_ERROR', 'Query validation failed', error.errors);
        }
    };
}
//# sourceMappingURL=common.js.map