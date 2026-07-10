import { createDb, schema } from '@pilotnow/db';
import { BILLING_STATUS } from '@pilotnow/shared';
import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';

const billingStatus = z.enum(BILLING_STATUS);
const uuid = z.string().uuid();

const listQuery = z.object({
  status: billingStatus.optional(),
});

const markBilledPayload = z.object({
  invoiceNumber: z.string().trim().min(1),
  billedAt: z.string().datetime().optional(),
});

let db: ReturnType<typeof createDb> | undefined;

function getDb() {
  db ??= createDb();
  return db;
}

function jsonError(c: Context, status: 400 | 403 | 404, message: string) {
  return c.json({ error: message }, status);
}

function serializeBilling(row: BillingRow) {
  return {
    id: row.job.jobCode,
    customer: { id: row.customer.id, name: row.customer.name },
    site: { id: row.site.id, name: row.site.name, address: row.site.address },
    startAt: row.job.startAt.toISOString(),
    endAt: row.job.endAt.toISOString(),
    status: row.job.status,
    billingStatus: row.job.billingStatus,
    invoiceNumber: row.job.invoiceNumber,
    billedAt: row.job.billedAt?.toISOString() ?? null,
  };
}

async function audit(action: string, entityId: string, detail?: Record<string, unknown>, actor?: { type: 'HUMAN' | 'AGENT'; id: string }) {
  await getDb().insert(schema.auditEvents).values({
    actorType: actor?.type ?? 'HUMAN',
    actorId: actor?.id ?? 'user:unknown',
    action,
    entityType: 'job',
    entityId,
    detail,
  });
}

async function findBillingJob(id: string) {
  const byCode = await findBillingJobWhere(eq(schema.jobs.jobCode, id));
  if (byCode) return byCode;

  const parsed = uuid.safeParse(id);
  return parsed.success ? findBillingJobWhere(eq(schema.jobs.id, parsed.data)) : null;
}

async function findBillingJobWhere(where: ReturnType<typeof eq>) {
  const [row] = await getDb()
    .select()
    .from(schema.jobs)
    .innerJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
    .innerJoin(schema.sites, eq(schema.jobs.siteId, schema.sites.id))
    .where(where)
    .limit(1);

  return row ? { job: row.jobs, customer: row.customers, site: row.sites } : null;
}

type BillingRow = NonNullable<Awaited<ReturnType<typeof findBillingJob>>>;

export const billing = new Hono()
  .get('/', async (c) => {
    const parsed = listQuery.safeParse(c.req.query());
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid billing query');
    }

    const filters = [
      eq(schema.jobs.status, 'COMPLETED'),
      parsed.data.status ? eq(schema.jobs.billingStatus, parsed.data.status) : undefined,
    ].filter((item) => item !== undefined);

    const rows = await getDb()
      .select()
      .from(schema.jobs)
      .innerJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
      .innerJoin(schema.sites, eq(schema.jobs.siteId, schema.sites.id))
      .where(and(...filters))
      .orderBy(desc(schema.jobs.startAt));

    return c.json({
      items: rows.map((row) =>
        serializeBilling({
          job: row.jobs,
          customer: row.customers,
          site: row.sites,
        }),
      ),
    });
  })
  .get('/:id', async (c) => {
    const row = await findBillingJob(c.req.param('id'));
    if (!row) {
      return jsonError(c, 404, 'Billing job not found');
    }
    return c.json({ item: serializeBilling(row) });
  })
  .post('/:id/mark-billed', async (c) => {
    const actor = c.get('actor');
    if (actor.type === 'AGENT') {
      return jsonError(c, 403, 'Agents cannot mark jobs billed');
    }

    const parsed = markBilledPayload.safeParse(await c.req.json().catch(() => undefined));
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid billing payload');
    }

    const row = await findBillingJob(c.req.param('id'));
    if (!row) {
      return jsonError(c, 404, 'Billing job not found');
    }
    if (row.job.status !== 'COMPLETED') {
      return jsonError(c, 400, 'Only completed jobs can be billed');
    }

    const billedAt = parsed.data.billedAt ? new Date(parsed.data.billedAt) : new Date();
    await getDb()
      .update(schema.jobs)
      .set({
        billingStatus: 'BILLED',
        invoiceNumber: parsed.data.invoiceNumber,
        billedAt,
      })
      .where(eq(schema.jobs.id, row.job.id));

    await audit('job.mark_billed', row.job.id, { invoiceNumber: parsed.data.invoiceNumber, billedAt: billedAt.toISOString() }, actor);
    const next = await findBillingJob(row.job.id);
    return c.json({ item: next ? serializeBilling(next) : null });
  })
  .post('/:id/mark-unbilled', async (c) => {
    const actor = c.get('actor');
    if (actor.type === 'AGENT') {
      return jsonError(c, 403, 'Agents cannot reopen billing');
    }

    const row = await findBillingJob(c.req.param('id'));
    if (!row) {
      return jsonError(c, 404, 'Billing job not found');
    }

    await getDb()
      .update(schema.jobs)
      .set({
        billingStatus: 'NOT_BILLED',
        invoiceNumber: null,
        billedAt: null,
      })
      .where(eq(schema.jobs.id, row.job.id));

    await audit('job.mark_unbilled', row.job.id, undefined, actor);
    const next = await findBillingJob(row.job.id);
    return c.json({ item: next ? serializeBilling(next) : null });
  });
