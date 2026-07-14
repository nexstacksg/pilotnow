import { createDb, schema } from '@pilotnow/db';
import { desc, eq, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import type { Context } from 'hono';
import { z } from 'zod';

const officerStatus = z.enum(['NEW', 'ACTIVE', 'INACTIVE', 'BLOCKED']);
const uuid = z.string().uuid();

const officerCreate = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(6),
  status: officerStatus.optional(),
  icVerified: z.boolean().default(false),
  icMasked: z.string().trim().nullable().optional(),
  defaultHourlyRate: z.number().min(0).default(14),
  onboardingNote: z.string().trim().nullable().optional(),
});

const officerPatch = z
  .object({
    name: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(6).optional(),
    status: officerStatus.optional(),
    icVerified: z.boolean().optional(),
    icMasked: z.string().trim().nullable().optional(),
    defaultHourlyRate: z.number().min(0).optional(),
    onboardingNote: z.string().trim().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

let db: ReturnType<typeof createDb> | undefined;

function getDb() {
  db ??= createDb();
  return db;
}

function jsonError(c: Context, status: 400 | 404, message: string) {
  return c.json({ error: message }, status);
}

function decimal(value: string | number | null | undefined, fallback = 0) {
  if (value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function scheduledHours(startAt: Date, endAt: Date) {
  const milliseconds = endAt.getTime() - startAt.getTime();
  return Math.max(0, Math.round((milliseconds / 36_000) * 100) / 100);
}

function payableAmount(hoursWorked: number, rateAgreed: number) {
  return Math.round(hoursWorked * rateAgreed * 100) / 100;
}

function serializeOfficer(row: typeof schema.officers.$inferSelect & { jobsCount?: number }) {
  return {
    id: row.officerCode,
    name: row.name,
    phone: row.phone,
    status: row.status,
    active: row.active,
    icVerified: row.icVerified,
    icMasked: row.icMasked,
    defaultHourlyRate: decimal(row.defaultHourlyRate, 14),
    onboardingNote: row.onboardingNote,
    jobsCount: row.jobsCount ?? 0,
    createdAt: row.createdAt.toISOString(),
  };
}

async function audit(action: string, entityId: string, detail?: Record<string, unknown>, actor?: { type: 'HUMAN' | 'AGENT'; id: string }) {
  await getDb().insert(schema.auditEvents).values({
    actorType: actor?.type ?? 'HUMAN',
    actorId: actor?.id ?? 'user:unknown',
    action,
    entityType: 'officer',
    entityId,
    detail,
  });
}

async function findOfficer(id: string) {
  const byCode = await findOfficerWhere(eq(schema.officers.officerCode, id));
  if (byCode) return byCode;

  const parsed = uuid.safeParse(id);
  return parsed.success ? findOfficerWhere(eq(schema.officers.id, parsed.data)) : null;
}

async function findOfficerWhere(where: ReturnType<typeof eq>) {
  const [row] = await getDb()
    .select({
      id: schema.officers.id,
      officerCode: schema.officers.officerCode,
      name: schema.officers.name,
      phone: schema.officers.phone,
      status: schema.officers.status,
      active: schema.officers.active,
      icVerified: schema.officers.icVerified,
      icMasked: schema.officers.icMasked,
      defaultHourlyRate: schema.officers.defaultHourlyRate,
      onboardingNote: schema.officers.onboardingNote,
      createdAt: schema.officers.createdAt,
      jobsCount: sql<number>`count(${schema.jobAssignments.id})::int`,
    })
    .from(schema.officers)
    .leftJoin(schema.jobAssignments, eq(schema.officers.id, schema.jobAssignments.officerId))
    .where(where)
    .groupBy(schema.officers.id)
    .limit(1);

  return row ?? null;
}

async function nextOfficerCode() {
  const rows = await getDb().select({ officerCode: schema.officers.officerCode }).from(schema.officers);
  const max = rows.reduce((value, row) => {
    const match = /^OF-(\d+)$/.exec(row.officerCode);
    return match ? Math.max(value, Number(match[1])) : value;
  }, 0);
  return `OF-${String(max + 1).padStart(2, '0')}`;
}

export const officers = new Hono()
  .get('/', async (c) => {
    const rows = await getDb()
      .select({
        id: schema.officers.id,
        officerCode: schema.officers.officerCode,
        name: schema.officers.name,
        phone: schema.officers.phone,
        status: schema.officers.status,
        active: schema.officers.active,
        icVerified: schema.officers.icVerified,
        icMasked: schema.officers.icMasked,
        defaultHourlyRate: schema.officers.defaultHourlyRate,
        onboardingNote: schema.officers.onboardingNote,
        createdAt: schema.officers.createdAt,
        jobsCount: sql<number>`count(${schema.jobAssignments.id})::int`,
      })
      .from(schema.officers)
      .leftJoin(schema.jobAssignments, eq(schema.officers.id, schema.jobAssignments.officerId))
      .groupBy(schema.officers.id)
      .orderBy(desc(schema.officers.createdAt));

    return c.json({ items: rows.map(serializeOfficer) });
  })
  .get('/:id/jobs', async (c) => {
    const officer = await findOfficer(c.req.param('id'));
    if (!officer) {
      return jsonError(c, 404, 'Officer not found');
    }

    const rows = await getDb()
      .select({
        assignment: schema.jobAssignments,
        job: schema.jobs,
        customer: schema.customers,
        site: schema.sites,
      })
      .from(schema.jobAssignments)
      .innerJoin(schema.jobs, eq(schema.jobAssignments.jobId, schema.jobs.id))
      .innerJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
      .innerJoin(schema.sites, eq(schema.jobs.siteId, schema.sites.id))
      .where(eq(schema.jobAssignments.officerId, officer.id))
      .orderBy(desc(schema.jobs.startAt));

    return c.json({
      items: rows.map((row) => {
        const hoursWorked = decimal(row.assignment.hoursWorked, scheduledHours(row.job.startAt, row.job.endAt));
        const rateAgreed = decimal(row.assignment.rateAgreed, decimal(row.assignment.rateOffered, decimal(officer.defaultHourlyRate, 14)));
        const payable = decimal(row.assignment.payable, payableAmount(hoursWorked, rateAgreed));

        return {
          id: row.assignment.id,
          jobId: row.job.jobCode,
          customerName: row.customer.name,
          siteName: row.site.name,
          date: row.job.startAt.toISOString().slice(0, 10),
          startAt: row.job.startAt.toISOString(),
          endAt: row.job.endAt.toISOString(),
          rateAgreed,
          hoursWorked,
          payable,
          currency: row.assignment.currency,
          status: row.job.status,
          ackStatus: row.assignment.ackStatus,
          paymentStatus: row.assignment.paymentStatus,
        };
      }),
    });
  })
  .get('/:id', async (c) => {
    const row = await findOfficer(c.req.param('id'));
    if (!row) {
      return jsonError(c, 404, 'Officer not found');
    }
    return c.json({ item: serializeOfficer(row) });
  })
  .post('/', async (c) => {
    const parsed = officerCreate.safeParse(await c.req.json().catch(() => undefined));
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid officer payload');
    }
    const input = parsed.data;
    const status = input.icVerified ? 'ACTIVE' : 'NEW';

    const [officer] = await getDb()
      .insert(schema.officers)
      .values({
        officerCode: await nextOfficerCode(),
        name: input.name,
        phone: input.phone,
        status,
        active: status === 'ACTIVE',
        icVerified: input.icVerified,
        icMasked: input.icMasked,
        defaultHourlyRate: input.defaultHourlyRate.toFixed(2),
        onboardingNote: input.onboardingNote,
      })
      .returning({ id: schema.officers.id });

    if (!officer) {
      return jsonError(c, 400, 'Could not create officer');
    }

    await audit('officer.create', officer.id, { status: input.status, icVerified: input.icVerified }, c.get('actor'));
    const row = await findOfficer(officer.id);
    return c.json({ item: row ? serializeOfficer(row) : null }, 201);
  })
  .patch('/:id', async (c) => {
    const row = await findOfficer(c.req.param('id'));
    if (!row) {
      return jsonError(c, 404, 'Officer not found');
    }

    const parsed = officerPatch.safeParse(await c.req.json().catch(() => undefined));
    if (!parsed.success) {
      return jsonError(c, 400, 'Invalid officer payload');
    }
    const input = parsed.data;
    const icVerified = input.icVerified ?? row.icVerified;
    let status = input.status ?? row.status;

    if (input.icVerified === true && row.status === 'NEW' && !input.status) {
      status = 'ACTIVE';
    }
    if (!icVerified && status === 'ACTIVE') {
      return jsonError(c, 400, 'Active officers must have verified IC');
    }
    if (input.icVerified === false && !input.status) {
      status = 'NEW';
    }
    await getDb()
      .update(schema.officers)
      .set({
        name: input.name,
        phone: input.phone,
        status,
        active: status === 'ACTIVE',
        icVerified: input.icVerified,
        icMasked: input.icMasked,
        defaultHourlyRate: input.defaultHourlyRate !== undefined ? input.defaultHourlyRate.toFixed(2) : undefined,
        onboardingNote: input.onboardingNote,
      })
      .where(eq(schema.officers.id, row.id));

    await audit('officer.update', row.id, { ...input, status }, c.get('actor'));
    const next = await findOfficer(row.id);
    return c.json({ item: next ? serializeOfficer(next) : null });
  });
