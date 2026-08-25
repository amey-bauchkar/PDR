import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AuthRequest, asyncHandler } from '../middleware/auth.js';
import { AppError } from '../types/index.js';

// Default bcrypt hash for 'Autopdr123' if env var is missing
const DEFAULT_ADMIN_HASH = '$2b$12$VY62sWCijOpjAd4PxJ3KP.AD4JgjcHrB8jG7h20.VxVI8CabftB1G';

/**
 * POST /api/auth/login
 * Authenticate admin user and return JWT token
 */
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, 'MISSING_FIELDS', 'Email and password are required.');
  }

  const normalized = (email as string).trim().toLowerCase();
  const expectedEmail = (process.env.ADMIN_EMAIL || 'admin@pdrworld.com').trim().toLowerCase();
  const expectedUsername = (process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const passwordHash = (process.env.ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_HASH).trim();

  // Check if the provided email/username matches
  if (normalized !== expectedEmail && normalized !== expectedUsername) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  // Verify password against bcrypt hash
  const passwordValid = await bcrypt.compare(password as string, passwordHash);
  if (!passwordValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  // Generate JWT token
  const role = 'super_admin';
  const token = jwt.sign(
    {
      userId: expectedEmail,
      role,
    },
    config.jwt.secret,
    { expiresIn: 86400 } // 24 hours in seconds
  );

  res.json({
    success: true,
    token,
    role,
    email: expectedEmail,
    expiresIn: config.jwt.expiry,
    timestamp: Date.now(),
  });
});

/**
 * GET /api/auth/verify
 * Verify an existing JWT token is still valid
 */
export const verifySession = asyncHandler(async (req: AuthRequest, res: Response) => {
  // If we get here, the verifyToken middleware already validated the token
  res.json({
    success: true,
    userId: req.userId,
    role: req.userRole,
    timestamp: Date.now(),
  });
});
