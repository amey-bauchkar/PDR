import { Response, NextFunction, RequestHandler } from 'express';
import type { AuthRequest } from './common.js';
export type { AuthRequest };
export declare function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void;
export declare function requireRole(...allowedRoles: string[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare function asyncHandler(fn: (req: any, res: Response, next: NextFunction) => Promise<any> | any): RequestHandler;
//# sourceMappingURL=auth.d.ts.map