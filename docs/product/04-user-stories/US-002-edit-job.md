# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-002 |
| **Epic** | Job Management |
| **Feature** | Edit Job |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 5 story points |
| **Sprint** | Sprint 2 |

---

## Story

**As an** admin,
**I want** to edit an existing job's details via WhatsApp,
**so that** I can update site, time, officer count, or requirements when plans change.

## Acceptance Criteria

### Scenario 1: Happy path — Edit a job field

- **Given** a job (JOB-1234) exists with status "Open" or "Assigned"
- **When** I send "Edit JOB-1234: change time to 9am-5pm"
- **Then** the bot shows the updated job summary with changes highlighted
- **And** I confirm to save the changes

### Scenario 2: Edit triggers officer re-notification

- **Given** job JOB-1234 has officers already assigned
- **When** I confirm edits to time, date, or site
- **Then** all assigned officers receive a WhatsApp notification with the updated details
- **And** officers are asked to re-acknowledge the updated assignment

### Scenario 3: Edit a job that is in progress

- **Given** a job is currently in progress (officers have checked in)
- **When** I try to edit the job
- **Then** only end time and requirements can be modified
- **And** site, date, and start time fields are locked with explanation

### Scenario 4: Edit a completed or cancelled job

- **Given** a job has status "Completed" or "Cancelled"
- **When** I try to edit it
- **Then** the bot responds "This job is [completed/cancelled] and cannot be edited"

## UI/UX Notes

- Admin can reference job by ID: "Edit JOB-1234" or by context: "Edit the Marina Bay job tomorrow"
- Bot shows before/after comparison for changed fields:
  ```
  ✏️ Edit JOB-1234:
  ⏰ Time: 08:00–18:00 → 09:00–17:00

  Other details unchanged.
  ✅ Confirm | ❌ Cancel
  ```
- If editing reduces officer count, admin must choose which officers to unassign

## Edge Cases

- Edit that creates a scheduling conflict for an assigned officer → warn admin, suggest reassignment
- Edit officer count upward → admin prompted to assign additional officers
- Edit officer count downward → admin prompted to select which officers to remove
- Multiple rapid edits → only latest confirmed edit is saved
- Editing a recurring job → ask if edit applies to this instance only or all future instances

## Dependencies

- US-001: Job creation must exist
- US-003: Cancel job (for status checks)
- Officer assignment system (US-005) for re-notification

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Edit time on open job | "Edit JOB-1234: time 9am-5pm" → Confirm | Time updated, confirmation sent |
| 2 | Edit assigned job | Edit time on job with 2 assigned officers | Officers receive update notification |
| 3 | Edit in-progress job site | Try to change site on checked-in job | Bot rejects with explanation |
| 4 | Edit completed job | Try to edit a completed job | Bot rejects |
| 5 | Reduce officer count | Edit from 3 to 2 officers | Admin prompted to select officer to remove |

---

**Created by:** Aira · 2026-02-23
