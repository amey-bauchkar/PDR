import { calculatorService } from '../services/calculatorService.js';
import { asyncHandler } from '../middleware/auth.js';
/**
 * POST /api/calculator/optical-link-budget
 * Calculate optical link budget
 */
export const calculateOpticalLinkBudget = asyncHandler(async (req, res) => {
    const input = req.body;
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
export const generateOpticalLinkBudgetReport = asyncHandler(async (req, res) => {
    const input = req.body;
    const result = calculatorService.calculateOpticalLinkBudget(input);
    const report = calculatorService.generateDetailedReport(input, result);
    res.json({
        success: true,
        data: report,
        timestamp: Date.now(),
    });
});
//# sourceMappingURL=calculatorController.js.map