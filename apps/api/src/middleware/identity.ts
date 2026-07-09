// FR-035: every caller acts under an identity — HUMAN (admin UI session) or
// AGENT (MCP server with an agent token). Agents never use human accounts.
// Core logic uses this to hard-deny agents from finalizing actions
// (confirm job, complete, mark PAID, mark BILLED — see FR-032/FR-036).

import type { MiddlewareHandler } from 'hono';
import type { Actor } from '@pilotnow/shared';

declare module 'hono' {
  interface ContextVariableMap {
    actor: Actor;
  }
}

export function identity(): MiddlewareHandler {
  return async (c, next) => {
    // TODO: real auth. Placeholder: agent token header → AGENT, else HUMAN dev user.
    const agentToken = c.req.header('x-agent-token');
    if (agentToken) {
      // TODO: validate token, resolve agent name
      c.set('actor', { type: 'AGENT', id: 'agent:dev' });
    } else {
      c.set('actor', { type: 'HUMAN', id: 'user:dev' });
    }
    await next();
  };
}
