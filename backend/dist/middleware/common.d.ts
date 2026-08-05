import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    userId?: string;
    userRole?: string;
}
export declare function requestLogger(req: Request, res: Response, next: NextFunction): void;
export declare function validateBody(schema: any): (req: Request, res: Response, next: NextFunction) => void;
export declare function validateQuery(schema: any): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=common.d.ts.map