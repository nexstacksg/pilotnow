# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-019 |
| **Epic** | AI Fulfilment Automation |
| **Feature** | Customer Order to AI-Driven Fulfilment |
| **PRD Ref** | PRD v2.2 — Section 1.1, FR-032–FR-036 |
| **Priority** | Could (backlog; requires CR to activate) |
| **Size** | 13 story points |
| **Sprint** | Backlog |

---

> **Architecture note (PRD v2.2):** This story is **not a PilotNow core feature**. It describes a **skill set for the external agent layer** (e.g. Hermes, OpenClaw). The agent owns the WhatsApp conversations and performs every system action through the MCP tool surface over the Web API, under a restricted agent identity (FR-034/FR-035). All finalizing actions remain subject to the draft-and-confirm and hard-denial rules (FR-032/FR-036) — e.g. "assigns the officer automatically" below means the agent proposes the assignment and configured rules or a human admin confirm it. The PilotNow core contains no AI and needs no change beyond exposing the tools; delivering this story means authoring and testing agent skills plus the negotiation-limit configuration.

---

## Story

**As a** customer,
**I want** to paste a manpower request into WhatsApp and have PilotNow AI source, secure, and schedule officers automatically,
**so that** my order can be fulfilled without manual back-and-forth.

## Acceptance Criteria

### Scenario 1: Customer order is parsed and acknowledged

- **Given** I send a WhatsApp message with order details
- **When** the AI detects the request as a manpower order
- **Then** the AI immediately acknowledges receipt
- **And** the system creates a draft job with parsed fields

### Scenario 2: AI finds and secures an officer within allowed rules

- **Given** the draft job has all required fields
- **When** the AI searches candidate officers and sends an offer
- **Then** the AI may negotiate within configured commercial limits
- **And** once the officer accepts, the system assigns the officer automatically
- **And** the job status changes to Assigned

### Scenario 3: Customer is updated when coverage is secured

- **Given** an officer has accepted the shift
- **When** assignment is recorded
- **Then** the customer thread receives a fulfilment update
- **And** the customer sees that the order is covered

### Scenario 4: AI escalates when commercial or operational limits are exceeded

- **Given** the officer counters above allowed rate limits, no suitable candidate is found, or service risk increases
- **When** the AI cannot complete fulfilment safely
- **Then** the case is escalated to a human dispatcher or admin
- **And** the escalation state is recorded in the system

### Scenario 5: Pre-shift readiness continues automatically after assignment

- **Given** the order has been fulfilled
- **When** the shift start approaches
- **Then** the officer receives configured reminders
- **And** readiness / acknowledgement state is recorded
- **And** missing response triggers soft escalation before shift start

## UI/UX Notes

- Customer-facing messages should be short, confident, and operationally clear
- Officer negotiation messages must show the proposed shift and rate clearly
- Admin monitoring should show sourcing status, current candidate, offered rate, counter-offer, and escalation reason

## Edge Cases

- Customer message contains ambiguous date or location → AI asks a clarifying question before sourcing
- Multiple officers decline → system marks fulfilment risk and escalates based on threshold
- Officer accepts after escalation already happened → admin sees latest state and can confirm or replace
- Customer should not see sensitive internal ranking or negotiation notes unless explicitly allowed by configuration

## Dependencies

- External agent runtime (e.g. Hermes, OpenClaw) with WhatsApp channel ownership
- PilotNow MCP tool surface over the Web API (FR-034), with agent identity and permissions (FR-035)
- Draft-and-confirm endpoints for job/assignment/rate proposals (FR-036)
- Officer master data and availability logic
- Negotiation boundary rules by client / shift / officer type (configured in PilotNow, enforced by core logic)
- Escalation routing to admin / dispatcher

---

**Created by:** Aira · 2026-05-16
