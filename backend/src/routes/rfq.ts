import { Router } from 'express';
import * as RfqController from '../controllers/rfqController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

/**
 * RFQ routes — Public (customer submissions)
 */
router.post('/submit', RfqController.submitRfq);
router.post('/log-sheets', RfqController.logSheetsDirect);

/**
 * RFQ routes — Admin only (requires JWT)
 */
router.get('/list', verifyToken, RfqController.listRfqsForAdminPanel);
router.get('/:id', verifyToken, RfqController.getRfq);
router.get('/', verifyToken, RfqController.getAllRfqs);

export default router;
