import { Response } from 'express';
import { rfqService } from '../services/RfqService.js';
import { AuthRequest, asyncHandler } from '../middleware/auth.js';
import { QuoteItem } from '../types/index.js';

/**
 * POST /api/rfq/submit
 * Submit an RFQ
 */
export const submitRfq = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { sessionHash, name, email, company, items } = req.body;

  const rfq = await rfqService.submitRfq(
    sessionHash as string,
    name as string,
    email as string,
    company as string,
    items as QuoteItem[]
  );

  res.status(201).json({
    success: true,
    data: rfq,
    timestamp: Date.now(),
  });
});

/**
 * GET /api/rfq/:id
 * Get RFQ by ID
 */
export const getRfq = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rfq = await rfqService.getRfq(req.params.id);

  res.json({
    success: true,
    data: rfq,
    timestamp: Date.now(),
  });
});

/**
 * GET /api/rfq
 * Get all RFQs (admin only)
 */
export const getAllRfqs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const result = await rfqService.getAllRfqs(page, pageSize);

  res.json({
    success: true,
    data: result,
    timestamp: Date.now(),
  });
});
