# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-004 |
| **Epic** | Job Management |
| **Feature** | Recurring Jobs |
| **PRD Ref** | PRD v2.2 — see also Section 1.1, FR-032–FR-036 |
| **Priority** | Should |
| **Size** | 8 story points |
| **Sprint** | Sprint 2 |

---

> **Architecture note (PRD v2.2):** The PilotNow software contains **no AI/LLM element** (FR-033). Natural-language recurring-job creation is performed by the **external agent layer** via the MCP tool surface: the agent detects the recurrence pattern and proposes a draft recurring job; the core validates, stores, and generates instances deterministically, and the admin confirms (FR-034–FR-036). Structured input remains a pure core feature.

## Story

**As an** admin,
**I want** to create recurring weekly jobs in PilotNow using natural language or structured input,
**so that** I don't have to manually recreate the same job every week.

## Acceptance Criteria

### Scenario 1: Create recurring job via natural language

- **Given** I am using PilotNow recurring job creation
- **When** I send "2 officers at Raffles Place every Monday 8am-6pm"
- **Then** the LLM detects the recurring pattern (weekly, Monday)
- **And** the system shows a summary with recurrence details and asks for confirmation
- **And** on confirmation, job instances are generated for the upcoming weeks

### Scenario 2: Create recurring job via structured input

- **Given** I send "Create recurring job"
- **When** the system walks me through structured fields (site, day, time, count, recurrence)
- **Then** I fill in each field step by step
- **And** the system creates the recurring schedule on confirmation

### Scenario 3: Auto-generation of weekly instances

- **Given** a recurring job is set for every Monday
- **When** the system runs its weekly job generation (e.g., Sunday evening)
- **Then** the next week's job instance is automatically created with status "Open"
- **And** admin is notified: "📅 Recurring job JOB-xxxx created for Mon 3 Mar at Raffles Place"

### Scenario 4: Edit a single instance vs all future

- **Given** a recurring job has upcoming instances
- **When** I edit one instance
- **Then** the system asks "Apply to this instance only or all future instances?"
- **And** changes are applied accordingly

### Scenario 5: Stop a recurring job

- **Given** a recurring job is active
- **When** I send "Stop recurring job for Raffles Place Mondays"
- **Then** the system confirms and no further instances are generated
- **And** already-created future instances remain unless explicitly cancelled

## UI/UX Notes

- System summary for recurring:
  ```
  🔁 Recurring Job:
  📍 Site: Raffles Place
  📅 Every Monday
  ⏰ Time: 08:00 – 18:00
  👥 Officers: 2
  🔄 Recurrence: Weekly (no end date)

  ✅ Confirm | ✏️ Edit | ❌ Cancel
  ```
- Admin can set end date: "every Monday until end of March"
- Officers may be pre-suggested or prefilled for recurring instances based on configured rules, but admin remains able to review and adjust each instance before execution

## Edge Cases

- Public holiday falls on recurring day → still creates instance (admin can cancel individually)
- Recurring job with no end date → generate rolling 4 weeks ahead
- Admin creates duplicate recurring pattern → warn "You already have a weekly Monday job at Raffles Place"
- Recurring job site no longer active → flag for admin review

## Dependencies

- US-001: Job creation
- Scheduler/cron for auto-generation of weekly instances
- Site registry

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | NL recurring creation | "3 officers at MBS every Wed 7am-7pm" → Confirm | Recurring job created, next instance generated |
| 2 | Structured recurring | Follow system prompts to create recurring | Same result as NL |
| 3 | Auto-generation | Wait for weekly generation trigger | New instance created, admin notified |
| 4 | Edit single instance | Edit one Monday's job, select "this only" | Only that instance changes |
| 5 | Stop recurrence | "Stop recurring Raffles Place Monday job" | No new instances generated |
| 6 | Duplicate detection | Create same recurring pattern twice | Warning shown |

---

**Created by:** Aira · 2026-02-23
