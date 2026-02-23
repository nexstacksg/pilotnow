# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-003 |
| **Epic** | Job Management |
| **Feature** | Cancel Job |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 3 story points |
| **Sprint** | Sprint 2 |

---

## Story

**As an** admin,
**I want** to cancel a job via WhatsApp,
**so that** assigned officers are notified immediately and the job is removed from active scheduling.

## Acceptance Criteria

### Scenario 1: Cancel an open job (no officers assigned)

- **Given** job JOB-1234 exists with status "Open" and no officers assigned
- **When** I send "Cancel JOB-1234"
- **Then** the bot asks for confirmation: "Cancel JOB-1234 at Marina Bay Tower on 24 Feb? ✅ Yes | ❌ No"
- **And** on confirmation, the job status changes to "Cancelled"

### Scenario 2: Cancel a job with assigned officers

- **Given** job JOB-1234 has 3 officers assigned
- **When** I confirm cancellation
- **Then** all 3 officers receive a WhatsApp message: "Job JOB-1234 at Marina Bay Tower on 24 Feb has been cancelled"
- **And** all officer assignments are released (officers become available)
- **And** job status changes to "Cancelled"

### Scenario 3: Cancel a job in progress

- **Given** officers have already checked in to job JOB-1234
- **When** I try to cancel
- **Then** the bot warns: "⚠️ 2 officers have already checked in. Cancel anyway? ✅ Yes | ❌ No"
- **And** on confirmation, checked-in officers are auto checked-out with reason "Job cancelled"
- **And** partial attendance is recorded for DO reporting

### Scenario 4: Cancel a completed job

- **Given** job JOB-1234 is already completed
- **When** I try to cancel it
- **Then** the bot responds "JOB-1234 is already completed and cannot be cancelled"

## UI/UX Notes

- Admin can cancel by ID or context: "Cancel JOB-1234" or "Cancel the MBS job tomorrow"
- Always require explicit confirmation before cancellation
- Officer notification should be clear and immediate
- Cancellation reason is optional: bot asks "Any reason? (or skip)"

## Edge Cases

- Cancel a recurring job → ask "Cancel this instance only or all future instances?"
- Cancel while officer is mid-check-in → handle gracefully, don't corrupt attendance data
- Network delay: admin confirms cancel but officers already checked in between → handle race condition

## Dependencies

- US-001: Job must exist
- US-005: Officer assignment for notification
- Attendance system for in-progress cancellation handling

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Cancel open job | "Cancel JOB-1234" → Confirm | Job cancelled, status updated |
| 2 | Cancel assigned job | Cancel job with 2 officers | Both officers notified |
| 3 | Cancel in-progress job | Cancel job with checked-in officers | Warning shown, partial attendance recorded |
| 4 | Cancel completed job | Try to cancel completed job | Rejected with message |
| 5 | Cancel without confirmation | "Cancel JOB-1234" → "No" | Job remains active |

---

**Created by:** Aira · 2026-02-23
