import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';
export declare function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function notFoundHandler(req: Request, res: Response): void;
//# sourceMappingURL=errorHandler.d.ts.map