import { Router } from 'express';
import * as RfqController from '../controllers/rfqController.js';
import { verifyToken } from '../middleware/auth.js';
const router = Router();
/**
 * RFQ routes — Public (customer submissions)
 */
router.post('/submit', RfqController.submitRfq);
/**
 * RFQ routes — Admin only (requires JWT)
 */
router.post('/log-sheets', verifyToken, RfqController.logSheetsDirect);
router.get('/list', verifyToken, RfqController.listRfqsForAdminPanel);
router.get('/:id', verifyToken, RfqController.getRfq);
router.get('/', verifyToken, RfqController.getAllRfqs);
export default router;
//# sourceMappingURL=rfq.js.map