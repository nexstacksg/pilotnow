import { createDb, schema } from '@pilotnow/db';
import { PAYMENT_STATUS } from '@pilotnow/shared';
import { and, desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';

const paymentStatus = z.enum(PAYMENT_STATUS);
const uuid = z.string().uuid();

const listQuery = z.object({
  status: paymentStatus.optional(),
  officerId: uuid.optional(),
  jobId: z.string().trim().min(1).optional(),
});

const payablePatch = z
  .object({
    hoursWorked: z.number().min(0).optional(),
    rateAgreed: z.number().min(0).optional(),
    paymentRef: z.string().trim().nullable().optional(),
    hoursNote: z.string().trim().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

const markPaidPayload = z.object({
  paymentRef: z.string().trim().optional(),
  paidAt: z.string().datetime().optional(),
});

let db: ReturnType<typeof createDb> | undefined;

function getDb() {
  db ??= createDb();
  return db;
}

function jsonError(c: Context, status: 400 | 403 | 404, message: string) {
  return c.json({ error: message }, status);
}

function decimal(value: string | number | null | undefined, fallback = 0) {
  if (value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function scheduledHours(startAt: Date, endAt: Date) {
  const milliseconds = endAt.getTime() - startAt.getTime();
  return Math.max(0, Math.round((milliseconds / 3_600_000) * 100) / 100);
}

function payableAmount(hoursWorked: number, rateAgreed: number) {
  return Math.round(hoursWorked * rateAgreed * 100) / 100;
}

function serializePayable(row: PayableRow) {
  const hoursWorked = decimal(row.assignment.hoursWorked, scheduledHours(row.job.startAt, row.job.endAt));
  const rateAgreed = decimal(row.assignment.rateAgreed, decimal(row.assignment.rateOffered));
  const payable = decimal(row.assignment.payable, payableAmount(hoursWorked, rateAgreed));

  return {
    id: row.assignment.id,
    officer: {
      id: row.officer.id,
      name: row.officer.name,
      phone: row.officer.phone,
    },
    job: {
      id: row.job.jobCode,
      customerName: row.customer.name,
      siteName: row.site.name,
      startAt: row.job.startAt.toISOString(),
      endAt: row.job.endAt.toISOString(),
    },
    hoursWorked,
    rateAgreed,
    payable,
    currency: row.assignment.currency,
    status: row.assignment.paymentStatus,
    paidAt: row.assignment.paidAt?.toISOString() ?? null,
    paymentRef: row.assignment.paymentRef,
  };
}

async function audit(action: string, entityId: string, detail?: Record<string, unknown>, actor?: { type: 'HUMAN' | 'AGENT'; id: string }) {
  await getDb().insert(schema.auditEvents).values({
    actorType: actor?.type ?? 'HUMAN',
    actorId: actor?.id ?? 'user:unknown',
    action,
    entityType: 'assignment',
    entityId,
    detail,
  });
}

async function findAssignment(id: string) {
  const [row] = await getDb()
    .select()
    .from(schema.jobAssignments)
    .innerJoin(schema.officers, eq(schema.jobAssignments.officerId, schema.officers.id))
    .innerJoin(schema.jobs, eq(schema.jobAssignments.jobId, schema.jobs.id))
    .innerJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
    .innerJoin(schema.sites, eq(schema.jobs.siteId, schema.sites.id))
    .where(eq(schema.jobAssignments.id, id))
    .limit(1);

  return row
    ? {
        assignment: row.job_assignments,
        officer: row.officers,
        job: row.jobs,
        customer: row.customers,
        site: row.sites,
      }
    : null;
}

type PayableRow = NonNullable<Awaited<ReturnType<typeof findAssignment>>>;

export const payables = new Hono()
  .get('/', async (c) => {
    const parsed = listQuery.safeParse(c.req.query());
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid payable query');
    }
    const query = parsed.data;
    const filters = [
      query.status ? eq(schema.jobAssignments.paymentStatus, query.status) : undefined,
      query.officerId ? eq(schema.jobAssignments.officerId, query.officerId) : undefined,
      query.jobId ? eq(schema.jobs.jobCode, query.jobId) : undefined,
    ].filter((item) => item !== undefined);

    const rows = await getDb()
      .select()
      .from(schema.jobAssignments)
      .innerJoin(schema.officers, eq(schema.jobAssignments.officerId, schema.officers.id))
      .innerJoin(schema.jobs, eq(schema.jobAssignments.jobId, schema.jobs.id))
      .innerJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
      .innerJoin(schema.sites, eq(schema.jobs.siteId, schema.sites.id))
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(schema.jobs.startAt));

    return c.json({
      items: rows.map((row) =>
        serializePayable({
          assignment: row.job_assignments,
          officer: row.officers,
          job: row.jobs,
          customer: row.customers,
          site: row.sites,
        }),
      ),
    });
  })
  .get('/:id', async (c) => {
    const id = c.req.param('id');
    const parsed = uuid.safeParse(id);
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid payable id');
    }
    const row = await findAssignment(parsed.data);
    if (!row) {
      return jsonError(c, 404, 'Payable not found');
    }
    return c.json({ item: serializePayable(row) });
  })
  .patch('/:id', async (c) => {
    const id = c.req.param('id');
    const parsedId = uuid.safeParse(id);
    if (!parsedId.success) {
      return jsonError(c, 400, 'Invalid payable id');
    }
    const parsed = payablePatch.safeParse(await c.req.json().catch(() => undefined));
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid payable payload');
    }

    const row = await findAssignment(parsedId.data);
    if (!row) {
      return jsonError(c, 404, 'Payable not found');
    }
    if (row.assignment.paymentStatus === 'PAID') {
      return jsonError(c, 400, 'Paid payables cannot be edited');
    }

    const input = parsed.data;
    const hoursWorked = input.hoursWorked ?? decimal(row.assignment.hoursWorked, scheduledHours(row.job.startAt, row.job.endAt));
    const rateAgreed = input.rateAgreed ?? decimal(row.assignment.rateAgreed, decimal(row.assignment.rateOffered));
    const payable = payableAmount(hoursWorked, rateAgreed);

    await getDb()
      .update(schema.jobAssignments)
      .set({
        hoursWorked: input.hoursWorked !== undefined ? hoursWorked.toFixed(2) : undefined,
        rateAgreed: input.rateAgreed !== undefined ? rateAgreed.toFixed(2) : undefined,
        payable: payable.toFixed(2),
        paymentRef: input.paymentRef,
        hoursNote: input.hoursNote,
      })
      .where(eq(schema.jobAssignments.id, row.assignment.id));

    await audit('assignment.payable_update', row.assignment.id, { ...input, payable }, c.get('actor'));
    const next = await findAssignment(row.assignment.id);
    return c.json({ item: next ? serializePayable(next) : null });
  })
  .post('/:id/mark-paid', async (c) => {
    const actor = c.get('actor');
    if (actor.type === 'AGENT') {
      return jsonError(c, 403, 'Agents cannot mark payables paid');
    }

    const id = c.req.param('id');
    const parsedId = uuid.safeParse(id);
    if (!parsedId.success) {
      return jsonError(c, 400, 'Invalid payable id');
    }
    const parsed = markPaidPayload.safeParse(await c.req.json().catch(() => ({})));
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid mark-paid payload');
    }

    const row = await findAssignment(parsedId.data);
    if (!row) {
      return jsonError(c, 404, 'Payable not found');
    }

    const hoursWorked = decimal(row.assignment.hoursWorked, scheduledHours(row.job.startAt, row.job.endAt));
    const rateAgreed = decimal(row.assignment.rateAgreed, decimal(row.assignment.rateOffered));
    const payable = payableAmount(hoursWorked, rateAgreed);
    const paidAt = parsed.data.paidAt ? new Date(parsed.data.paidAt) : new Date();

    await getDb()
      .update(schema.jobAssignments)
      .set({
        hoursWorked: hoursWorked.toFixed(2),
        payable: payable.toFixed(2),
        paymentStatus: 'PAID',
        paidAt,
        paymentRef: parsed.data.paymentRef,
      })
      .where(eq(schema.jobAssignments.id, row.assignment.id));

    await audit('assignment.mark_paid', row.assignment.id, { payable, paymentRef: parsed.data.paymentRef }, actor);
    const next = await findAssignment(row.assignment.id);
    return c.json({ item: next ? serializePayable(next) : null });
  })
  .post('/:id/mark-unpaid', async (c) => {
    const actor = c.get('actor');
    if (actor.type === 'AGENT') {
      return jsonError(c, 403, 'Agents cannot reopen paid payables');
    }

    const id = c.req.param('id');
    const parsedId = uuid.safeParse(id);
    if (!parsedId.success) {
      return jsonError(c, 400, 'Invalid payable id');
    }
    const row = await findAssignment(parsedId.data);
    if (!row) {
      return jsonError(c, 404, 'Payable not found');
    }

    await getDb()
      .update(schema.jobAssignments)
      .set({
        paymentStatus: 'UNPAID',
        paidAt: null,
        paymentRef: null,
      })
      .where(eq(schema.jobAssignments.id, row.assignment.id));

    await audit('assignment.mark_unpaid', row.assignment.id, undefined, actor);
    const next = await findAssignment(row.assignment.id);
    return c.json({ item: next ? serializePayable(next) : null });
  });
