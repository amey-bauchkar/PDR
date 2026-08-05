import { contactService } from '../services/contactService.js';
import { asyncHandler } from '../middleware/auth.js';
export const submitContactInquiry = asyncHandler(async (req, res) => {
    const result = await contactService.submitContactInquiry(req.body);
    res.status(201).json({
        success: true,
        data: result,
        timestamp: Date.now(),
    });
});
//# sourceMappingURL=contactController.js.map