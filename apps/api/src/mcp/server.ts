// MCP tool surface (FR-034) — served by the same Hono app at /mcp via
// @hono/mcp (Streamable HTTP transport). This layer stays THIN: tool
// handlers only call the same services the REST routes use; validation,
// permissions, and status transitions are enforced in core logic only.
//
// Planned tools (agent-allowed unless noted):
//   create_draft_job, list_jobs, get_job,
//   search_officers, record_interested_officer,
//   propose_assignment, propose_rate, record_acknowledgement,
//   record_proof_photo, flag_exception, get_payable_summary
// Human-only (hard-denied for AGENT identity in core logic, FR-035/036):
//   confirm_job, complete_job, mark_paid, mark_billed

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function createMcpServer() {
  const server = new McpServer({
    name: 'pilotnow',
    version: '0.1.0',
  });

  server.registerTool(
    'ping',
    {
      description: 'Health check for the PilotNow MCP tool surface',
      inputSchema: { message: z.string().optional() },
    },
    async ({ message }) => ({
      content: [
        {
          type: 'text',
          text: JSON.stringify({ ok: true, echo: message ?? null }),
        },
      ],
    }),
  );

  // TODO: register workflow-step tools listed above, delegating to services/.

  return server;
}
