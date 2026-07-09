import { Hono } from 'hono';

// TODO: implement — see PRD v2.2 functional requirements referenced in app.ts.
// Keep handlers CHAINED so route types flow into AppType for the RPC client.
export const payables = new Hono().get('/', (c) =>
  c.json({ items: [] as unknown[], todo: 'payables not implemented yet' }, 501),
);
