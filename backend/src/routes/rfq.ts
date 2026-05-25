import { Router } from 'express';
import * as RfqController from '../controllers/rfqController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

/**
 * RFQ routes
 */
router.post('/submit', RfqController.submitRfq);
router.get('/:id', RfqController.getRfq);

// Admin only
router.get('/', verifyToken, RfqController.getAllRfqs);

export default router;
