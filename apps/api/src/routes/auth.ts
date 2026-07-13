import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import {
  SESSION_COOKIE,
  createAdminSession,
  deleteAdminSession,
  ensureBootstrapAdmin,
  findAdminByEmail,
  findAdminById,
  verifyPassword,
} from '../services/auth.js';

const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().default(false),
});

export const auth = new Hono()
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
  .post('/logout', async (c) => {
    await deleteAdminSession(getCookie(c, SESSION_COOKIE));
    deleteCookie(c, SESSION_COOKIE, { path: '/' });
    return c.body(null, 204);
  });
