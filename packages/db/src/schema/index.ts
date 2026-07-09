// PilotNow schema — PRD v2.2. Status models per Section 6; audit per FR-029/FR-035;
// draft-and-confirm per FR-036. Baseline only — extend via migrations.

import {
  pgTable,
  pgEnum,
  text,
  uuid,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

// --- enums (keep in sync with @pilotnow/shared) ---

export const jobStatus = pgEnum('job_status', [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);

export const billingStatus = pgEnum('billing_status', ['NOT_BILLED', 'BILLED']);

export const paymentStatus = pgEnum('payment_status', ['UNPAID', 'PAID']);

export const ackStatus = pgEnum('ack_status', [
  'PENDING',
  'ACKNOWLEDGED',
  'DECLINED',
  'NO_RESPONSE',
]);

export const actorType = pgEnum('actor_type', ['HUMAN', 'AGENT']);

export const recordState = pgEnum('record_state', ['DRAFT', 'CONFIRMED']);

// --- master data ---

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  contact: text('contact'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sites = pgTable('sites', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  name: text('name').notNull(),
  address: text('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// FR-005/FR-006 — officer master; IC stored masked, full record access-controlled
export const officers = pgTable('officers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  active: boolean('active').notNull().default(true),
  icVerified: boolean('ic_verified').notNull().default(false),
  icMasked: text('ic_masked'),
  onboardingNote: text('onboarding_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// --- operations ---

// FR-001..004, FR-017, FR-022
export const jobs = pgTable(
  'jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id').notNull().references(() => customers.id),
    siteId: uuid('site_id').notNull().references(() => sites.id),
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }).notNull(),
    headcountRequired: integer('headcount_required').notNull().default(1),
    instructions: text('instructions'),
    requestSource: text('request_source'), // whatsapp | email | manual
    requestRaw: text('request_raw'), // pasted customer message
    status: jobStatus('status').notNull().default('OPEN'),
    billingStatus: billingStatus('billing_status').notNull().default('NOT_BILLED'),
    // FR-036: agent-created jobs start as DRAFT; human confirmation flips to CONFIRMED
    recordState: recordState('record_state').notNull().default('CONFIRMED'),
    postedToGroupAt: timestamp('posted_to_group_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('jobs_status_idx').on(t.status), index('jobs_start_idx').on(t.startAt)],
);

// FR-003, FR-007..010, FR-018..021 — one row per officer per job
export const jobAssignments = pgTable(
  'job_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id').notNull().references(() => jobs.id),
    officerId: uuid('officer_id').notNull().references(() => officers.id),
    // FR-007: rates are assignment-specific
    rateOffered: numeric('rate_offered', { precision: 10, scale: 2 }),
    rateAgreed: numeric('rate_agreed', { precision: 10, scale: 2 }),
    currency: text('currency').notNull().default('SGD'),
    rateNote: text('rate_note'),
    ackStatus: ackStatus('ack_status').notNull().default('PENDING'),
    reportedOnDutyAt: timestamp('reported_on_duty_at', { withTimezone: true }),
    // FR-018: default scheduled hours, admin-adjustable with reason
    hoursWorked: numeric('hours_worked', { precision: 6, scale: 2 }),
    hoursNote: text('hours_note'),
    // FR-019: payable = hoursWorked × rateAgreed
    payable: numeric('payable', { precision: 10, scale: 2 }),
    paymentStatus: paymentStatus('payment_status').notNull().default('UNPAID'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    paymentRef: text('payment_ref'),
    // FR-036: agent-proposed assignments start as DRAFT
    recordState: recordState('record_state').notNull().default('CONFIRMED'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('assignments_job_idx').on(t.jobId), index('assignments_officer_idx').on(t.officerId)],
);

// FR-013..016 — hourly proof, linked to job/officer/assignment/window
export const proofPhotos = pgTable(
  'proof_photos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    jobId: uuid('job_id').notNull().references(() => jobs.id),
    assignmentId: uuid('assignment_id').notNull().references(() => jobAssignments.id),
    officerId: uuid('officer_id').notNull().references(() => officers.id),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
    mediaRef: text('media_ref').notNull(),
    proofWindow: text('proof_window'), // e.g. "2026-07-09T14:00/15:00"
    matchNote: text('match_note'), // admin correction if manually matched
  },
  (t) => [index('proofs_assignment_idx').on(t.assignmentId)],
);

// FR-029 + FR-035 — audit trail with human/agent attribution
export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorType: actorType('actor_type').notNull(),
    actorId: text('actor_id').notNull(), // "user:<id>" or "agent:<name>"
    action: text('action').notNull(), // e.g. "job.create", "assignment.mark_paid"
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id'),
    detail: jsonb('detail'),
    conversationRef: text('conversation_ref'), // triggering WhatsApp/message ref, if agent-initiated
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('audit_entity_idx').on(t.entityType, t.entityId)],
);
