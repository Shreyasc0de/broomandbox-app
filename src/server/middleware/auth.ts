import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

// JWT secret from environment (REQUIRED - no fallback for security)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '8h';

// Fallback admin credentials from environment (used if DB not set up)
const ENV_ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ENV_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Validate required environment variables on startup
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required');
}
if (!ENV_ADMIN_USERNAME || !ENV_ADMIN_PASSWORD) {
  throw new Error('FATAL: ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required');
}

export interface AuthRequest extends Request {
  user?: { username: string };
}

/**
 * JWT authentication middleware
 * Protects routes by requiring a valid Bearer token
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as { username: string };
    req.user = decoded;
    next();
  } catch (_err) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
}

/**
 * Authenticate admin credentials and return JWT token
 * Checks database first, falls back to env vars
 */
export async function authenticateAdmin(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string; userId?: string }> {
  try {
    // Try database authentication first
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, username, password_hash, role')
      .eq('username', username)
      .single();

    if (user && !error) {
      // Found user in database, verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (validPassword) {
        const token = jwt.sign(
          { username: user.username, userId: user.id, role: user.role },
          JWT_SECRET!,
          { expiresIn: JWT_EXPIRES_IN }
        );
        return { success: true, token, userId: user.id };
      }
      return { success: false, error: 'Invalid credentials' };
    }
  } catch (_e) {
    // Database not available, fall through to env auth
  }

  // Fallback to environment variables (for initial setup)
  if (username === ENV_ADMIN_USERNAME && password === ENV_ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN });
    return { success: true, token };
  }

  return { success: false, error: 'Invalid credentials' };
}

/**
 * Change admin password
 */
export async function changeAdminPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  // Get current user
  const { data: user, error } = await supabase
    .from('admin_users')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return { success: false, error: 'User not found' };
  }

  // Verify current password
  const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
  if (!validPassword) {
    return { success: false, error: 'Current password is incorrect' };
  }

  // Hash new password
  const saltRounds = 12;
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  const { error: updateError } = await supabase
    .from('admin_users')
    .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (updateError) {
    return { success: false, error: 'Failed to update password' };
  }

  return { success: true };
}

/**
 * Input validation helpers
 */
export const validators = {
  email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  phone: (phone: string) => /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone),
  zipCode: (zip: string) => /^\d{5}$/.test(zip),
  sanitize: (str: string) => str?.trim().slice(0, 500) || '',
  required: (value: unknown) => value !== undefined && value !== null && value !== '',
};
