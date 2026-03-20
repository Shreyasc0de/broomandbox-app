import type { Express } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateAdmin, changeAdminPassword, requireAuth, type AuthRequest } from '../middleware/auth.js';

/**
 * Register authentication routes
 */
export function registerAuthRoutes(app: Express) {
  // Rate limiting for login attempts
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit login attempts (increased for development)
    message: { error: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Login endpoint
  app.post('/api/auth/login', authLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await authenticateAdmin(username, password);

    if (result.success && result.token) {
      return res.json({ success: true, token: result.token });
    }

    return res.status(401).json({ error: result.error || 'Invalid credentials' });
  });

  // Verify token endpoint
  app.get('/api/auth/verify', requireAuth, (req: AuthRequest, res) => {
    res.json({ valid: true, user: req.user });
  });

  // Change password endpoint
  app.post('/api/auth/change-password', requireAuth, async (req: AuthRequest, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req.user as any)?.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    if (!userId) {
      return res.status(400).json({ 
        error: 'Password change requires database authentication. Run the admin migration first.' 
      });
    }

    const result = await changeAdminPassword(userId, currentPassword, newPassword);

    if (result.success) {
      return res.json({ success: true, message: 'Password changed successfully' });
    }

    return res.status(400).json({ error: result.error });
  });

  // Logout is handled client-side (just delete token)
  // This endpoint is optional but useful for audit logging
  app.post('/api/auth/logout', requireAuth, (req: AuthRequest, res) => {
    // In a production app, you might invalidate the token in a blocklist
    console.log(`User ${req.user?.username} logged out`);
    res.json({ success: true });
  });
}
