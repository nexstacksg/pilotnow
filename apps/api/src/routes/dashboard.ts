import { createDb, schema } from '@pilotnow/db';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';

const HOUR_MS = 60 * 60 * 1000;
const PROOF_GRACE_MS = 10 * 60 * 1000;

let db: ReturnType<typeof createDb> | undefined;

function getDb() {
  db ??= createDb();
  return db;
}

function singaporeOperatingDay(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  const date = `${value('year')}-${value('month')}-${value('day')}`;
  const start = new Date(`${date}T00:00:00+08:00`);
  return { date, start, end: new Date(start.getTime() + 24 * HOUR_MS) };
}

function effectiveStatus(
  job: typeof schema.jobs.$inferSelect,
  assigned: number,
  now: Date,
) {
  if (job.status === 'CANCELLED' || job.status === 'COMPLETED') return job.status;
  if (now >= job.endAt) return 'COMPLETED' as const;
  if (now >= job.startAt) return 'IN_PROGRESS' as const;
  return assigned >= job.headcountRequired ? ('ASSIGNED' as const) : ('OPEN' as const);
}

function proofWindowStart(value: string | null) {
  if (!value) return null;
  const raw = value.split('/')[0] ?? '';
  const start = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(raw) ? raw : `${raw}+08:00`);
  return Number.isNaN(start.getTime()) ? null : start;
}

export const dashboard = new Hono().get('/', async (c) => {
  const now = new Date();
  const operatingDay = singaporeOperatingDay(now);
  const jobRows = await getDb()
    .select()
    .from(schema.jobs)
    .innerJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
    .innerJoin(schema.sites, eq(schema.jobs.siteId, schema.sites.id))
    .where(eq(schema.jobs.recordState, 'CONFIRMED'));
  const assignmentRows = await getDb()
    .select({ assignment: schema.jobAssignments, officer: schema.officers })
    .from(schema.jobAssignments)
    .innerJoin(schema.officers, eq(schema.jobAssignments.officerId, schema.officers.id))
    .where(eq(schema.jobAssignments.recordState, 'CONFIRMED'));
  const proofRows = await getDb().select().from(schema.proofPhotos);

  const assignmentsByJob = new Map<string, typeof assignmentRows>();
  for (const row of assignmentRows) {
    const rows = assignmentsByJob.get(row.assignment.jobId) ?? [];
    rows.push(row);
    assignmentsByJob.set(row.assignment.jobId, rows);
  }

  const proofsByAssignment = new Map<string, typeof proofRows>();
  for (const proof of proofRows) {
    const rows = proofsByAssignment.get(proof.assignmentId) ?? [];
    rows.push(proof);
    proofsByAssignment.set(proof.assignmentId, rows);
  }

  const missingProofs: {
    jobId: string;
    customer: string;
    officer: string;
    expectedAt: string;
  }[] = [];

  const items = jobRows.map((row) => {
    const assignments = assignmentsByJob.get(row.jobs.id) ?? [];
    const status = effectiveStatus(row.jobs, assignments.length, now);
    const jobMissingProofs: typeof missingProofs = [];

    if (status === 'IN_PROGRESS') {
      for (const { assignment, officer } of assignments) {
        if (!assignment.reportedOnDutyAt) continue;
        const onDutyAt = Math.max(row.jobs.startAt.getTime(), assignment.reportedOnDutyAt.getTime());
        const firstCheckpoint = new Date(Math.ceil(onDutyAt / HOUR_MS) * HOUR_MS);
        const cutoff = Math.min(now.getTime(), row.jobs.endAt.getTime());
        const proofs = proofsByAssignment.get(assignment.id) ?? [];

        for (let due = firstCheckpoint.getTime(); due + PROOF_GRACE_MS <= cutoff; due += HOUR_MS) {
          const received = proofs.some((proof) => {
            const windowStart = proofWindowStart(proof.proofWindow);
            if (windowStart) return Math.abs(windowStart.getTime() - due) < 60_000;
            return proof.receivedAt.getTime() >= due && proof.receivedAt.getTime() < due + HOUR_MS;
          });
          if (!received) {
            jobMissingProofs.push({
              jobId: row.jobs.jobCode,
              customer: row.customers.name,
              officer: officer.name,
              expectedAt: new Date(due).toISOString(),
            });
          }
        }
      }
    }
    missingProofs.push(...jobMissingProofs);

    const proofCount = assignments.reduce((count, { assignment }) => count + (proofsByAssignment.get(assignment.id)?.length ?? 0), 0);
    return {
      id: row.jobs.jobCode,
      customer: row.customers.name,
      location: row.sites.address || row.sites.name,
      startAt: row.jobs.startAt.toISOString(),
      endAt: row.jobs.endAt.toISOString(),
      required: row.jobs.headcountRequired,
      assigned: assignments.length,
      status,
      proofStatus: jobMissingProofs.length ? ('MISSING' as const) : proofCount ? ('RECEIVED' as const) : ('NOT_DUE' as const),
      billingStatus: row.jobs.billingStatus,
      hasUnpaidPayables: status === 'COMPLETED' && assignments.some(({ assignment }) => assignment.paymentStatus === 'UNPAID'),
    };
  });

  const todayJobs = items
    .filter((item) => {
      const start = new Date(item.startAt);
      return start >= operatingDay.start && start < operatingDay.end && item.status !== 'CANCELLED';
    })
    .sort((a, b) => a.startAt.localeCompare(b.startAt));
  const unbilledJobs = items
    .filter((item) => item.status === 'COMPLETED' && item.billingStatus === 'NOT_BILLED')
    .sort((a, b) => b.endAt.localeCompare(a.endAt));
  const waitingJobs = todayJobs.filter((item) => item.status !== 'COMPLETED' && item.assigned < item.required);

  return c.json({
    item: {
      operatingDate: operatingDay.date,
      generatedAt: now.toISOString(),
      metrics: {
        todayJobs: todayJobs.length,
        waitingJobs: waitingJobs.length,
        ongoingJobs: items.filter((item) => item.status === 'IN_PROGRESS').length,
        missingPhotos: missingProofs.length,
        officersNeeded: waitingJobs.reduce((sum, item) => sum + Math.max(0, item.required - item.assigned), 0),
        notBilled: unbilledJobs.length,
        unpaidPayables: items.filter((item) => item.hasUnpaidPayables).length,
      },
      todayJobs,
      missingProofs: missingProofs.sort((a, b) => a.expectedAt.localeCompare(b.expectedAt)),
      unbilledJobs,
    },
  });
});
