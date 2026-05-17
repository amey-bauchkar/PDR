import { Response } from 'express';
import { calculatorService } from '../services/CalculatorService.js';
import { AuthRequest, asyncHandler } from '../middleware/auth.js';
import { OpticalLinkBudgetInput } from '../types/index.js';

/**
 * POST /api/calculator/optical-link-budget
 * Calculate optical link budget
 */
export const calculateOpticalLinkBudget = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input = req.body as OpticalLinkBudgetInput;

  const result = calculatorService.calculateOpticalLinkBudget(input);

  res.json({
    success: true,
    data: result,
    timestamp: Date.now(),
  });
});

/**
 * POST /api/calculator/optical-link-budget/report
 * Generate detailed optical link budget report
 */
export const generateOpticalLinkBudgetReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const input = req.body as OpticalLinkBudgetInput;

    const result = calculatorService.calculateOpticalLinkBudget(input);
    const report = calculatorService.generateDetailedReport(input, result);

    res.json({
      success: true,
      data: report,
      timestamp: Date.now(),
    });
  }
);
