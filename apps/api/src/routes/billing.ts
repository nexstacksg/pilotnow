import { Hono } from 'hono';

// TODO: implement — see PRD v2.2 functional requirements referenced in app.ts.
// Keep handlers CHAINED so route types flow into AppType for the RPC client.
export const billing = new Hono().get('/', (c) =>
  c.json({ items: [] as unknown[], todo: 'billing not implemented yet' }, 501),
);
