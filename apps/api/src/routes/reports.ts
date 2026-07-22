import { createDb, schema } from '@pilotnow/db';
import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';

const HOUR_MS = 60 * 60 * 1000;
const PROOF_GRACE_MS = 10 * 60 * 1000;

let db: ReturnType<typeof createDb> | undefined;

function getDb() {
  db ??= createDb();
  return db;
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

function singaporeParts(value: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '00';
  return { year: part('year'), month: part('month'), day: part('day'), hour: part('hour'), minute: part('minute') };
}

function singaporeDate(value: Date) {
  const parts = singaporeParts(value);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function singaporeTime(value: Date) {
  const parts = singaporeParts(value);
  return `${parts.hour}:${parts.minute}`;
}

function scheduledHourlyCheckpoints(startAt: Date, endAt: Date, now: Date) {
  const cutoff = Math.min(now.getTime(), endAt.getTime());
  const checkpoints: Date[] = [];

  for (let due = startAt.getTime() + HOUR_MS; due < endAt.getTime() && due + PROOF_GRACE_MS <= cutoff; due += HOUR_MS) {
    checkpoints.push(new Date(due));
  }

  return checkpoints;
}

function payableFor(row: {
  assignment: typeof schema.jobAssignments.$inferSelect | null;
  job: typeof schema.jobs.$inferSelect;
}) {
  if (!row.assignment) return 0;
  const hours = decimal(row.assignment.hoursWorked, scheduledHours(row.job.startAt, row.job.endAt));
  const rate = decimal(row.assignment.rateAgreed, decimal(row.assignment.rateOffered));
  return decimal(row.assignment.payable, Math.round(hours * rate * 100) / 100);
}

function proofWindowStart(value: string | null) {
  if (!value) return null;
  const raw = value.split('/')[0] ?? '';
  const start = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(raw) ? raw : `${raw}+08:00`);
  return Number.isNaN(start.getTime()) ? null : start;
}

function proofMatchesCheckpoint(proof: typeof schema.proofPhotos.$inferSelect, due: Date, checkpoint: string) {
  if (proof.proofWindow === checkpoint) return true;

  const windowStart = proofWindowStart(proof.proofWindow);
  if (windowStart) return Math.abs(windowStart.getTime() - due.getTime()) < 60_000;

  return proof.receivedAt.getTime() >= due.getTime() && proof.receivedAt.getTime() < due.getTime() + HOUR_MS;
}

export const reports = new Hono().get('/', async (c) => {
  const now = new Date();
  const jobs = await getDb()
    .select()
    .from(schema.jobs)
    .innerJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
    .innerJoin(schema.sites, eq(schema.jobs.siteId, schema.sites.id))
    .orderBy(desc(schema.jobs.startAt));

  const assignments = await getDb()
    .select()
    .from(schema.jobAssignments)
    .innerJoin(schema.jobs, eq(schema.jobAssignments.jobId, schema.jobs.id))
    .innerJoin(schema.officers, eq(schema.jobAssignments.officerId, schema.officers.id));

  const officers = await getDb().select({ id: schema.officers.id }).from(schema.officers);
  const proofRows = await getDb().select().from(schema.proofPhotos);

  const completedJobs = jobs.filter((row) => row.jobs.status === 'COMPLETED');
  const totalPayroll = assignments.reduce((sum, row) => sum + payableFor({ assignment: row.job_assignments, job: row.jobs }), 0);

  const assignmentCounts = assignments.reduce<Record<string, number>>((counts, row) => {
    counts[row.jobs.id] = (counts[row.jobs.id] ?? 0) + 1;
    return counts;
  }, {});

  const payrollByJob = assignments.reduce<Record<string, number>>((totals, row) => {
    totals[row.jobs.id] = (totals[row.jobs.id] ?? 0) + payableFor({ assignment: row.job_assignments, job: row.jobs });
    return totals;
  }, {});

  const assignmentsByJob = new Map<string, typeof assignments>();
  for (const row of assignments) {
    const rows = assignmentsByJob.get(row.jobs.id) ?? [];
    rows.push(row);
    assignmentsByJob.set(row.jobs.id, rows);
  }

  const proofsByAssignment = new Map<string, typeof proofRows>();
  for (const proof of proofRows) {
    const rows = proofsByAssignment.get(proof.assignmentId) ?? [];
    rows.push(proof);
    proofsByAssignment.set(proof.assignmentId, rows);
  }

  const missingCheckpoints = jobs.flatMap((row) => {
    const jobAssignments = assignmentsByJob.get(row.jobs.id) ?? [];
    if (row.jobs.status === 'CANCELLED' || now < row.jobs.startAt) return [];

    return jobAssignments.flatMap((assignmentRow) => {
      const assignment = assignmentRow.job_assignments;
      const proofs = proofsByAssignment.get(assignment.id) ?? [];
      const missing: {
        id: string;
        job: string;
        customer: string;
        date: string;
        checkpoint: string;
        note: string;
      }[] = [];

      for (const dueAt of scheduledHourlyCheckpoints(row.jobs.startAt, row.jobs.endAt, now)) {
        const checkpoint = singaporeTime(dueAt);
        const received = proofs.some((proof) => proofMatchesCheckpoint(proof, dueAt, checkpoint));

        if (!received) {
          missing.push({
            id: `${row.jobs.jobCode}-${assignment.id}-${dueAt.toISOString()}`,
            job: row.jobs.jobCode,
            customer: row.customers.name,
            date: singaporeDate(row.jobs.startAt),
            checkpoint,
            note: `${assignmentRow.officers.name} missed hourly photo at ${checkpoint}`,
          });
        }
      }

      return missing;
    });
  });

  return c.json({
    item: {
      metrics: {
        completedJobs: completedJobs.length,
        totalPayroll,
        missingCheckpoints: missingCheckpoints.length,
        officers: officers.length,
      },
      completedJobs: completedJobs.map((row) => ({
        id: row.jobs.jobCode,
        customer: row.customers.name,
        site: row.sites.name,
        date: row.jobs.startAt.toISOString().slice(0, 10),
        officers: assignmentCounts[row.jobs.id] ?? 0,
        totalPayable: payrollByJob[row.jobs.id] ?? 0,
        billingStatus: row.jobs.billingStatus,
      })),
      missingCheckpoints: missingCheckpoints.sort((a, b) => a.id.localeCompare(b.id)),
    },
  });
});
