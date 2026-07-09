// Shared domain constants and types — PRD v2.2 Section 6 status models.
// The core is pure software (FR-033); these state machines are the source of truth
// for every caller (admin web UI and MCP agents alike).

export const JOB_STATUS = [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;
export type JobStatus = (typeof JOB_STATUS)[number];

// Per completed job — separate from job execution status (PRD 6.2)
export const BILLING_STATUS = ['NOT_BILLED', 'BILLED'] as const;
export type BillingStatus = (typeof BILLING_STATUS)[number];

// Per officer assignment — separate from customer billing status (PRD 6.3)
export const PAYMENT_STATUS = ['UNPAID', 'PAID'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

// FR-009 acknowledgement tracking
export const ACK_STATUS = [
  'PENDING',
  'ACKNOWLEDGED',
  'DECLINED',
  'NO_RESPONSE',
] as const;
export type AckStatus = (typeof ACK_STATUS)[number];

// FR-035 audit attribution — every mutation records who acted
export const ACTOR_TYPE = ['HUMAN', 'AGENT'] as const;
export type ActorType = (typeof ACTOR_TYPE)[number];

// FR-036 draft-and-confirm — agent-created records start as drafts
export const RECORD_STATE = ['DRAFT', 'CONFIRMED'] as const;
export type RecordState = (typeof RECORD_STATE)[number];

export interface Actor {
  type: ActorType;
  /** user id for HUMAN, agent name (e.g. "hermes") for AGENT */
  id: string;
}
