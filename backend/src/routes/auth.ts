import { Router } from 'express';
import { login, verifySession } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

/**
 * Auth routes
 */
router.post('/login', login);
router.get('/verify', verifyToken, verifySession);

export default router;
