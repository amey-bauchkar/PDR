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

// Demo credentials (replace with backend auth in production)
const DEMO_CREDENTIALS = [
  { email: 'admin@pdrworld.com', password: 'Admin@123', role: 'super_admin' as AdminRole },
  { email: 'manager@pdrworld.com', password: 'Manager@123', role: 'admin' as AdminRole },
];

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

export const verifyCredentials = (email: string, password: string): AdminRole | null => {
  // Demo-only authentication. In production, this calls a backend endpoint.
  const user = DEMO_CREDENTIALS.find((u) => u.email === email && u.password === password);
  return user ? user.role : null;
};

export const hashData = (data: string): string => {
  // Simple hash for demo. Use bcrypt or similar in production.
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};
