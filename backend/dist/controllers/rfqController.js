import { rfqService } from '../services/rfqService.js';
import { asyncHandler } from '../middleware/auth.js';
/**
 * POST /api/rfq/submit
 * Submit an RFQ
 */
export const submitRfq = asyncHandler(async (req, res) => {
    const { sessionHash, name, email, company, notes, items } = req.body;
    const rfq = await rfqService.submitRfq(sessionHash, name, email, company, notes, items);
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
export const getRfq = asyncHandler(async (req, res) => {
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
export const getAllRfqs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const result = await rfqService.getAllRfqs(page, pageSize);
    res.json({
        success: true,
        data: result,
        timestamp: Date.now(),
    });
});
/**
 * GET /api/rfq/list
 * Get all RFQs for the Vite admin panel
 */
export const listRfqsForAdminPanel = asyncHandler(async (_req, res) => {
    const rfqs = await rfqService.getAdminRfqList();
    res.json({
        success: true,
        data: rfqs,
        total: rfqs.length,
        timestamp: Date.now(),
    });
});
//# sourceMappingURL=rfqController.js.map