import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import {
  SESSION_COOKIE,
  completePasswordReset,
  changeAdminPassword,
  createAdminSession,
  deleteAdminSession,
  ensureBootstrapAdmin,
  findAdminByEmail,
  findAdminById,
  findAdminProfileById,
  requestPasswordReset,
  verifyPasswordResetCode,
  verifyPassword,
  updateAdminProfile,
} from '../services/auth.js';
import { PasswordResetDeliveryError, assertPasswordResetEmailConfigured } from '../services/email.js';

const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().default(false),
});

const resetRequestInput = z.object({
  email: z.string().email(),
});

const resetVerifyInput = resetRequestInput.extend({
  code: z.string().regex(/^\d{4}$/),
});

const resetCompleteInput = z.object({
  resetToken: z.string().min(32),
  password: z.string()
    .min(8)
    .max(128)
    .regex(/[A-Za-z]/)
    .regex(/\d/),
});

const profileInput = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(32).nullable(),
  avatarUrl: z.string().max(1_500_000).regex(/^data:image\/(?:png|jpeg|webp);base64,/).nullable(),
});

const passwordChangeInput = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128).regex(/[A-Za-z]/).regex(/\d/),
});

export const auth = new Hono()
  .post('/password-reset/request', async (c) => {
    const parsed = resetRequestInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'A valid email address is required' }, 400);

    try {
      assertPasswordResetEmailConfigured();
      const result = await requestPasswordReset(parsed.data.email);
      return c.json({
        message: 'If an active account matches that email, a reset code has been sent.',
        ...result,
      }, 202);
    } catch (error) {
      if (error instanceof PasswordResetDeliveryError) {
        return c.json({ error: 'Password-reset email is temporarily unavailable. Please try again.' }, 503);
      }
      throw error;
    }
  })
  .post('/password-reset/verify', async (c) => {
    const parsed = resetVerifyInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'A valid email address and four-digit code are required' }, 400);

    const resetToken = await verifyPasswordResetCode(parsed.data.email, parsed.data.code);
    if (!resetToken) return c.json({ error: 'The verification code is invalid or has expired' }, 400);
    return c.json({ resetToken });
  })
  .post('/password-reset/complete', async (c) => {
    const parsed = resetCompleteInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) {
      return c.json({ error: 'Use 8-128 characters with at least one letter and one number' }, 400);
    }

    const completed = await completePasswordReset(parsed.data.resetToken, parsed.data.password);
    if (!completed) return c.json({ error: 'The password-reset session is invalid or has expired' }, 400);
    return c.body(null, 204);
  })
  .post('/login', async (c) => {
    const parsed = loginInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'A valid email and password are required' }, 400);

    await ensureBootstrapAdmin();
    const admin = await findAdminByEmail(parsed.data.email);
    if (!admin || !admin.active || !(await verifyPassword(parsed.data.password, admin.passwordHash))) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const session = await createAdminSession(admin.id, parsed.data.remember);
    setCookie(c, SESSION_COOKIE, session.token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      ...(session.maxAge ? { maxAge: session.maxAge } : {}),
    });

    return c.json({ user: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
  })
  .get('/me', async (c) => {
    const actor = c.get('actor');
    if (actor.type !== 'HUMAN') return c.json({ error: 'Human administrator required' }, 403);

    const admin = await findAdminById(actor.id.replace(/^user:/, ''));
    if (!admin) return c.json({ error: 'Authentication required' }, 401);
    return c.json({ user: admin });
  })
  .get('/profile', async (c) => {
    const actor = c.get('actor');
    if (actor.type !== 'HUMAN') return c.json({ error: 'Human administrator required' }, 403);
    const profile = await findAdminProfileById(actor.id.replace(/^user:/, ''));
    if (!profile) return c.json({ error: 'Authentication required' }, 401);
    return c.json({ profile });
  })
  .put('/profile', async (c) => {
    const actor = c.get('actor');
    if (actor.type !== 'HUMAN') return c.json({ error: 'Human administrator required' }, 403);
    const parsed = profileInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'Enter a valid name, phone number, and profile photo' }, 400);
    const profile = await updateAdminProfile(actor.id.replace(/^user:/, ''), parsed.data);
    if (!profile) return c.json({ error: 'Profile could not be updated' }, 404);
    return c.json({ profile });
  })
  .put('/password', async (c) => {
    const actor = c.get('actor');
    if (actor.type !== 'HUMAN') return c.json({ error: 'Human administrator required' }, 403);
    const parsed = passwordChangeInput.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'Use 8-128 characters with at least one letter and one number' }, 400);
    const changed = await changeAdminPassword(actor.id.replace(/^user:/, ''), parsed.data.currentPassword, parsed.data.newPassword);
    if (!changed) return c.json({ error: 'Current password is incorrect' }, 400);
    return c.body(null, 204);
  })
  .post('/logout', async (c) => {
    await deleteAdminSession(getCookie(c, SESSION_COOKIE));
    deleteCookie(c, SESSION_COOKIE, { path: '/' });
    return c.body(null, 204);
  });
