import { Router } from 'express';
import * as CalculatorController from '../controllers/CalculatorController.js';

const router = Router();

/**
 * Calculator routes
 */
router.post('/optical-link-budget', CalculatorController.calculateOpticalLinkBudget);
router.post('/optical-link-budget/report', CalculatorController.generateOpticalLinkBudgetReport);

export default router;
