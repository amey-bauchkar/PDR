// Admin authentication and authorization utilities
// This module handles role-based access control and secure session management

export type AdminRole = 'admin' | 'super_admin' | 'viewer';

export interface AdminSession {
  id: string;
  email: string;
  role: AdminRole;
  permissions: Set<AdminPermission>;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

export type AdminPermission =
  | 'view_dashboard'
  | 'manage_products'
  | 'manage_users'
  | 'manage_rfqs'
  | 'view_analytics'
  | 'export_data'
  | 'manage_settings'
  | 'delete_products'
  | 'audit_logs';

const SESSION_STORAGE_KEY = 'pdrworld-admin-session-v1';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Role-based permission matrix
const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'view_dashboard',
    'manage_products',
    'manage_users',
    'manage_rfqs',
    'view_analytics',
    'export_data',
    'manage_settings',
    'delete_products',
    'audit_logs',
  ],
  admin: [
    'view_dashboard',
    'manage_products',
    'manage_rfqs',
    'view_analytics',
    'export_data',
    'delete_products',
    'audit_logs',
  ],
  viewer: ['view_dashboard', 'view_analytics'],
};

export const createSession = (email: string, role: AdminRole): AdminSession => {
  const now = Date.now();
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    role,
    permissions: new Set(ROLE_PERMISSIONS[role]),
    createdAt: now,
    expiresAt: now + SESSION_TIMEOUT,
    lastActivity: now,
  };
};

export const validateSessionTimeout = (session: AdminSession): boolean => {
  const now = Date.now();
  const isExpired = now > session.expiresAt;
  const isInactive = now - session.lastActivity > SESSION_TIMEOUT;
  return !isExpired && !isInactive;
};

export const updateSessionActivity = (session: AdminSession): AdminSession => {
  return {
    ...session,
    lastActivity: Date.now(),
  };
};

export const getStoredSession = (): AdminSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Omit<AdminSession, 'permissions'> & { permissions: string[] };
    const validatedSession: AdminSession = {
      ...session,
      permissions: new Set(session.permissions as AdminPermission[]),
    };
    if (validateSessionTimeout(validatedSession)) {
      return validatedSession;
    }
    clearStoredSession();
    return null;
  } catch {
    return null;
  }
};

export const storeSession = (session: AdminSession): void => {
  if (typeof window === 'undefined') return;
  const sessionData = {
    ...session,
    permissions: Array.from(session.permissions),
  };
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
};

export const clearStoredSession = (): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

export const checkPermission = (session: AdminSession, permission: AdminPermission): boolean => {
  return session.permissions.has(permission);
};

import { supabase } from './supabase';

export const verifyCredentials = async (emailOrUsername: string, password: string): Promise<{ role: AdminRole; token: string } | null> => {
  try {
    // If the user types 'admin', try to map to 'admin@pdrworld.com'
    const email = emailOrUsername.trim().toLowerCase() === 'admin' 
      ? 'admin@pdrworld.com' 
      : emailOrUsername.trim();

    if (!supabase) {
      console.warn("Supabase is not configured. Falling back to local development credentials.");
      if (
        (email === 'admin@pdrworld.com' || email === 'admin') &&
        (password === 'admin' || password === 'admin123' || password === 'pdrworld')
      ) {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('pdrworld-admin-token', 'dev-local-admin-token');
        }
        return { role: 'super_admin' as AdminRole, token: 'dev-local-admin-token' };
      }
      return null;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error("Supabase Auth Error:", error?.message);
      return null;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('pdrworld-admin-token', data.session.access_token);
    }

    return { role: 'super_admin' as AdminRole, token: data.session.access_token };
  } catch (err) {
    console.error("Auth Exception:", err);
    return null;
  }
};

// Get stored auth token for API requests
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem('pdrworld-admin-token');
};

// Clear auth token on logout
export const clearAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem('pdrworld-admin-token');
};

