import { createDb, schema } from '@pilotnow/db';
import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';

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
  return Math.max(0, Math.round((milliseconds / 36_000) * 100) / 100);
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

export const reports = new Hono().get('/', async (c) => {
  const jobs = await getDb()
    .select()
    .from(schema.jobs)
    .innerJoin(schema.customers, eq(schema.jobs.customerId, schema.customers.id))
    .innerJoin(schema.sites, eq(schema.jobs.siteId, schema.sites.id))
    .orderBy(desc(schema.jobs.startAt));

  const assignments = await getDb()
    .select()
    .from(schema.jobAssignments)
    .innerJoin(schema.jobs, eq(schema.jobAssignments.jobId, schema.jobs.id));

  const officers = await getDb().select({ id: schema.officers.id }).from(schema.officers);

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

  return c.json({
    item: {
      metrics: {
        completedJobs: completedJobs.length,
        totalPayroll,
        missingCheckpoints: 0,
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
    },
  });
});
