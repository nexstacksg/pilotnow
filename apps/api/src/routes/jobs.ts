import { createDb, schema } from '@pilotnow/db';
import { JOB_STATUS, BILLING_STATUS, RECORD_STATE } from '@pilotnow/shared';
import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';

const jobStatus = z.enum(JOB_STATUS);
const billingStatus = z.enum(BILLING_STATUS);
const recordState = z.enum(RECORD_STATE);
const uuid = z.string().uuid();

const jobCreate = z
  .object({
    customerId: uuid.optional(),
    customerName: z.string().trim().min(1).optional(),
    siteId: uuid.optional(),
    siteName: z.string().trim().min(1).optional(),
    siteAddress: z.string().trim().optional(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    headcountRequired: z.number().int().positive().default(1),
    instructions: z.string().trim().optional(),
    requestSource: z.string().trim().optional(),
    requestRaw: z.string().trim().optional(),
  })
  .refine((value) => value.customerId || value.customerName, 'customerId or customerName is required')
  .refine((value) => value.siteId || value.siteName, 'siteId or siteName is required');

const jobPatch = z.object({
  customerId: uuid.optional(),
  customerName: z.string().trim().min(1).optional(),
  siteId: uuid.optional(),
  siteName: z.string().trim().min(1).optional(),
  siteAddress: z.string().trim().nullable().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  headcountRequired: z.number().int().positive().optional(),
  instructions: z.string().trim().nullable().optional(),
  requestSource: z.string().trim().nullable().optional(),
  requestRaw: z.string().trim().nullable().optional(),
  status: jobStatus.optional(),
  billingStatus: billingStatus.optional(),
});

const listQuery = z.object({
  status: jobStatus.optional(),
  billingStatus: billingStatus.optional(),
  recordState: recordState.optional(),
});

let db: ReturnType<typeof createDb> | undefined;

function getDb() {
  db ??= createDb();
  return db;
}

function jsonError(c: Context, status: 400 | 403 | 404, message: string) {
  return c.json({ error: message }, status);
}

function serializeJob(row: {
  job: typeof schema.jobs.$inferSelect;
  customer: typeof schema.customers.$inferSelect;
  site: typeof schema.sites.$inferSelect;
}) {
  return {
    id: row.job.jobCode,
    customer: { id: row.customer.id, name: row.customer.name, contact: row.customer.contact },
    site: { id: row.site.id, name: row.site.name, address: row.site.address },
    startAt: row.job.startAt.toISOString(),
    endAt: row.job.endAt.toISOString(),
    headcountRequired: row.job.headcountRequired,
    instructions: row.job.instructions,
    requestSource: row.job.requestSource,
    requestRaw: row.job.requestRaw,
    status: row.job.status,
    billingStatus: row.job.billingStatus,
    invoiceNumber: row.job.invoiceNumber,
    billedAt: row.job.billedAt?.toISOString() ?? null,
    recordState: row.job.recordState,
    postedToGroupAt: row.job.postedToGroupAt?.toISOString() ?? null,
    createdAt: row.job.createdAt.toISOString(),
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

async function findJob(id: string) {
  const byCode = await findJobWhere(eq(schema.jobs.jobCode, id));
  if (byCode) return byCode;

  const parsed = uuid.safeParse(id);
  return parsed.success ? findJobWhere(eq(schema.jobs.id, parsed.data)) : null;
}

async function findJobWhere(where: ReturnType<typeof eq>) {
  const [row] = await getDb()
    .select()
    .from(schema.jobs)
    .innerJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
    .innerJoin(schema.sites, eq(schema.jobs.siteId, schema.sites.id))
    .where(where)
    .limit(1);

  return row ? { job: row.jobs, customer: row.customers, site: row.sites } : null;
}

async function nextJobCode() {
  const rows = await getDb().select({ jobCode: schema.jobs.jobCode }).from(schema.jobs);
  const max = rows.reduce((value, row) => {
    const match = /^PN-(\d+)$/.exec(row.jobCode);
    return match ? Math.max(value, Number(match[1])) : value;
  }, 2041);
  return `PN-${max + 1}`;
}

async function resolveCustomer(input: z.infer<typeof jobCreate>) {
  if (input.customerId) {
    return input.customerId;
  }
  if (!input.customerName) {
    throw new Error('customerId or customerName is required');
  }
  const [customer] = await getDb()
    .insert(schema.customers)
    .values({ name: input.customerName })
    .returning({ id: schema.customers.id });

  return customer?.id;
}

async function resolveSite(input: z.infer<typeof jobCreate>, customerId: string) {
  if (input.siteId) {
    return input.siteId;
  }
  if (!input.siteName) {
    throw new Error('siteId or siteName is required');
  }
  const [site] = await getDb()
    .insert(schema.sites)
    .values({ customerId, name: input.siteName, address: input.siteAddress })
    .returning({ id: schema.sites.id });

  return site?.id;
}

export const jobs = new Hono()
  .get('/', async (c) => {
    const parsed = listQuery.safeParse(c.req.query());
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid job query');
    }
    const query = parsed.data;
    const filters = [
      query.status ? eq(schema.jobs.status, query.status) : undefined,
      query.billingStatus ? eq(schema.jobs.billingStatus, query.billingStatus) : undefined,
      query.recordState ? eq(schema.jobs.recordState, query.recordState) : undefined,
    ].filter((item) => item !== undefined);

    const rows = await getDb()
      .select()
      .from(schema.jobs)
      .innerJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
      .innerJoin(schema.sites, eq(schema.jobs.siteId, schema.sites.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(schema.jobs.startAt));

    return c.json({ items: rows.map((row) => serializeJob({ job: row.jobs, customer: row.customers, site: row.sites })) });
  })
  .get('/:id', async (c) => {
    const row = await findJob(c.req.param('id'));
    if (!row) {
      return jsonError(c, 404, 'Job not found');
    }
    return c.json({ item: serializeJob(row) });
  })
  .post('/', async (c) => {
    const parsed = jobCreate.safeParse(await c.req.json().catch(() => undefined));
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid job payload');
    }
    const input = parsed.data;
    const actor = c.get('actor');
    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);

    if (endAt <= startAt) {
      return jsonError(c, 400, 'endAt must be after startAt');
    }

    const customerId = await resolveCustomer(input);
    if (!customerId) {
      return jsonError(c, 400, 'Could not create customer');
    }
    const siteId = await resolveSite(input, customerId);
    if (!siteId) {
      return jsonError(c, 400, 'Could not create site');
    }

    const [job] = await getDb()
      .insert(schema.jobs)
      .values({
        jobCode: await nextJobCode(),
        customerId,
        siteId,
        startAt,
        endAt,
        headcountRequired: input.headcountRequired,
        instructions: input.instructions,
        requestSource: input.requestSource,
        requestRaw: input.requestRaw,
        recordState: actor.type === 'AGENT' ? 'DRAFT' : 'CONFIRMED',
      })
      .returning({ id: schema.jobs.id });

    if (!job) {
      return jsonError(c, 400, 'Could not create job');
    }

    await audit('job.create', job.id, { recordState: actor.type === 'AGENT' ? 'DRAFT' : 'CONFIRMED' }, actor);
    const row = await findJob(job.id);
    return c.json({ item: row ? serializeJob(row) : null }, 201);
  })
  .patch('/:id', async (c) => {
    const id = c.req.param('id');
    const parsed = jobPatch.safeParse(await c.req.json().catch(() => undefined));
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid job payload');
    }
    const input = parsed.data;
    const actor = c.get('actor');
    const row = await findJob(id);
    if (!row) {
      return jsonError(c, 404, 'Job not found');
    }
    if (input.status === 'COMPLETED') {
      return jsonError(c, 400, 'Use /jobs/:id/complete to complete jobs');
    }
    if (input.billingStatus === 'BILLED') {
      return jsonError(c, 400, 'Use the billing module to mark jobs billed');
    }
    if (actor.type === 'AGENT' && input.status === 'CANCELLED') {
      return jsonError(c, 403, 'Agents cannot cancel jobs');
    }

    const startAt = input.startAt ? new Date(input.startAt) : row.job.startAt;
    const endAt = input.endAt ? new Date(input.endAt) : row.job.endAt;
    if (endAt <= startAt) {
      return jsonError(c, 400, 'endAt must be after startAt');
    }

    if (input.customerName) {
      await getDb().update(schema.customers).set({ name: input.customerName }).where(eq(schema.customers.id, row.job.customerId));
    }
    if (input.siteName !== undefined || input.siteAddress !== undefined) {
      await getDb()
        .update(schema.sites)
        .set({ name: input.siteName, address: input.siteAddress })
        .where(eq(schema.sites.id, row.job.siteId));
    }

    const [updated] = await getDb()
      .update(schema.jobs)
      .set({
        customerId: input.customerId,
        siteId: input.siteId,
        startAt: input.startAt ? startAt : undefined,
        endAt: input.endAt ? endAt : undefined,
        headcountRequired: input.headcountRequired,
        instructions: input.instructions,
        requestSource: input.requestSource,
        requestRaw: input.requestRaw,
        status: input.status,
        billingStatus: input.billingStatus,
      })
      .where(eq(schema.jobs.id, row.job.id))
      .returning({ id: schema.jobs.id });

    if (!updated) {
      return jsonError(c, 404, 'Job not found');
    }

    await audit('job.update', row.job.id, input, actor);
    const next = await findJob(id);
    return c.json({ item: next ? serializeJob(next) : null });
  })
  .post('/:id/confirm', async (c) => {
    const actor = c.get('actor');
    if (actor.type === 'AGENT') {
      return jsonError(c, 403, 'Agents cannot confirm jobs');
    }

    const id = c.req.param('id');
    const row = await findJob(id);
    if (!row) {
      return jsonError(c, 404, 'Job not found');
    }
    const [updated] = await getDb()
      .update(schema.jobs)
      .set({ recordState: 'CONFIRMED' })
      .where(eq(schema.jobs.id, row.job.id))
      .returning({ id: schema.jobs.id });

    if (!updated) {
      return jsonError(c, 404, 'Job not found');
    }

    await audit('job.confirm', row.job.id, undefined, actor);
    const next = await findJob(row.job.jobCode);
    return c.json({ item: next ? serializeJob(next) : null });
  })
  .post('/:id/complete', async (c) => {
    const actor = c.get('actor');
    if (actor.type === 'AGENT') {
      return jsonError(c, 403, 'Agents cannot complete jobs');
    }

    const id = c.req.param('id');
    const row = await findJob(id);
    if (!row) {
      return jsonError(c, 404, 'Job not found');
    }
    if (row.job.recordState !== 'CONFIRMED') {
      return jsonError(c, 400, 'Only confirmed jobs can be completed');
    }

    await getDb().update(schema.jobs).set({ status: 'COMPLETED' }).where(eq(schema.jobs.id, row.job.id));
    await audit('job.complete', row.job.id, undefined, actor);
    const next = await findJob(id);
    return c.json({ item: next ? serializeJob(next) : null });
  })
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    const row = await findJob(id);
    if (!row) {
      return jsonError(c, 404, 'Job not found');
    }
    const [updated] = await getDb()
      .update(schema.jobs)
      .set({ status: 'CANCELLED' })
      .where(eq(schema.jobs.id, row.job.id))
      .returning({ id: schema.jobs.id });

    if (!updated) {
      return jsonError(c, 404, 'Job not found');
    }

    await audit('job.cancel', row.job.id, undefined, c.get('actor'));
    const next = await findJob(row.job.jobCode);
    return c.json({ item: next ? serializeJob(next) : null });
  });
