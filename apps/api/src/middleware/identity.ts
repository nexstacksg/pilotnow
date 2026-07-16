// FR-035: every caller acts under an identity — HUMAN (admin UI session) or
// AGENT (MCP server with an agent token). Agents never use human accounts.
// Core logic uses this to hard-deny agents from finalizing actions
// (confirm job, complete, mark PAID, mark BILLED — see FR-032/FR-036).

import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import type { Actor } from '@pilotnow/shared';
import { findAdminBySessionToken, SESSION_COOKIE } from '../services/auth.js';

declare module 'hono' {
  interface ContextVariableMap {
    actor: Actor;
  }
}

const PUBLIC_PATHS = new Set([
  '/health',
  '/auth/login',
  '/auth/password-reset/request',
  '/auth/password-reset/verify',
  '/auth/password-reset/complete',
]);
function isPublicOfficerJobPath(path: string) {
  return /^\/officer-jobs\/[^/]+(?:\/(?:check-in|check-out|evidence|evidence-upload|evidence-file))?$/.test(path);
}

function isPublicSignReportPath(path: string) {
  return /^\/jobs\/[^/]+\/sign-report$/.test(path);
}

export function identity(): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.method === 'OPTIONS' || PUBLIC_PATHS.has(c.req.path) || isPublicOfficerJobPath(c.req.path) || isPublicSignReportPath(c.req.path)) {
      await next();
      return;
    }

    const agentToken = c.req.header('x-agent-token');
    if (agentToken) {
      // Agent credential validation remains separate from human admin sessions.
      c.set('actor', { type: 'AGENT', id: 'agent:dev' });
      await next();
      return;
    }

    const token = getCookie(c, SESSION_COOKIE);
    const admin = token ? await findAdminBySessionToken(token) : null;
    if (!admin) return c.json({ error: 'Authentication required' }, 401);

    c.set('actor', { type: 'HUMAN', id: `user:${admin.id}` });
    await next();
  };
}
