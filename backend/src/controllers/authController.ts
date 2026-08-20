import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AuthRequest, asyncHandler } from '../middleware/auth.js';
import { AppError } from '../types/index.js';

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pdrworld.com';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

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

  // Check if the provided email/username matches
  if (normalized !== ADMIN_EMAIL.toLowerCase() && normalized !== ADMIN_USERNAME.toLowerCase()) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  // Verify password against bcrypt hash
  if (!ADMIN_PASSWORD_HASH) {
    console.error('ADMIN_PASSWORD_HASH is not set in environment variables!');
    throw new AppError(500, 'CONFIG_ERROR', 'Server authentication is not configured.');
  }

  const passwordValid = await bcrypt.compare(password as string, ADMIN_PASSWORD_HASH);
  if (!passwordValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  // Generate JWT token
  const role = 'super_admin';
  const token = jwt.sign(
    {
      userId: ADMIN_EMAIL,
      role,
    },
    config.jwt.secret,
    { expiresIn: 86400 } // 24 hours in seconds
  );

  res.json({
    success: true,
    token,
    role,
    email: ADMIN_EMAIL,
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
