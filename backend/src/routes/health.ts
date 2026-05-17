import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
});

/**
 * API info endpoint
 */
router.get('/info', (req: Request, res: Response) => {
  res.json({
    name: 'PDR World API',
    version: '1.0.0',
    description: 'Professional Backend API for PDR World',
    timestamp: Date.now(),
  });
});

export default router;
