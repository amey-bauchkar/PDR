import { Router } from 'express';
import { submitContactInquiry } from '../controllers/contactController.js';

const router = Router();

router.post('/', submitContactInquiry);

export default router;