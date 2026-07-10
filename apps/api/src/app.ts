// PilotNow Web API — the single entry point (PRD v2.2 Section 1.1).
// The admin web UI and the MCP tool surface are peers: both call this API and
// receive identical business-rule enforcement. No business logic lives
// outside this app (not in the UI, not in the MCP adapter).
// Clients call it through the shared @pilotnow/api-client http wrapper
// (http.get / http.post / ...), which owns base URL and headers.

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { StreamableHTTPTransport } from '@hono/mcp';
import { loadEnv } from './env.js';
import { identity } from './middleware/identity.js';
import { createMcpServer } from './mcp/server.js';
import { health } from './routes/health.js';
import { jobs } from './routes/jobs.js';
import { officers } from './routes/officers.js';
import { assignments } from './routes/assignments.js';
import { proofs } from './routes/proofs.js';
import { payables } from './routes/payables.js';
import { billing } from './routes/billing.js';
import { reports } from './routes/reports.js';

loadEnv();

// FR-034: MCP tool surface for external AI agents (e.g. Hermes, OpenClaw),
// served over Streamable HTTP on this same app. Agents authenticate with
// x-agent-token and act under an AGENT identity (see middleware/identity.ts).
const mcpServer = createMcpServer();

export const app = new Hono()
  .onError((err, c) => {
    console.error(err);
    return c.json({ error: 'Internal server error' }, 500);
  })
  .use(logger())
  .use(cors())
  .use(identity()) // FR-035: resolve caller to HUMAN or AGENT identity
  .route('/health', health)
  .route('/jobs', jobs) // FR-001..003, FR-017 — intake, drafts, completion
  .route('/officers', officers) // FR-005..006 — master data, onboarding
  .route('/assignments', assignments) // FR-007..010 — rates, assignment, acknowledgement
  .route('/proofs', proofs) // FR-012..016 — report-on-duty, proof photos, exceptions
  .route('/payables', payables) // FR-018..021 — hours, payable computation, PAID/UNPAID
  .route('/billing', billing) // FR-022 — BILLED/NOT BILLED
  .route('/reports', reports)
  .all('/mcp', async (c) => {
    const transport = new StreamableHTTPTransport();
    await mcpServer.connect(transport);
    return transport.handleRequest(c);
  });

export type AppType = typeof app;
