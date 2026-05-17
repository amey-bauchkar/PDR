import { Response } from 'express';
import { contactService } from '../services/contactService.js';
import { AuthRequest, asyncHandler } from '../middleware/auth.js';

export const submitContactInquiry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await contactService.submitContactInquiry(req.body);

  res.status(201).json({
    success: true,
    data: result,
    timestamp: Date.now(),
  });
});