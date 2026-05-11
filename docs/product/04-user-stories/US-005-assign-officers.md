# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-005 |
| **Epic** | Officer Assignment |
| **Feature** | Assign Officers to Job |
| **PRD Ref** | See PRD v2.0 |
| **Priority** | Must |
| **Size** | 8 story points |
| **Sprint** | Sprint 2 |

---

## Story

**As an** admin,
**I want** to assign one or more officers to a job through PilotNow,
**so that** officers are notified of their assignment and I can manage staffing.

## Acceptance Criteria

### Scenario 1: Assign a single officer

- **Given** job JOB-1234 is open and needs 2 officers
- **When** I send "Assign Ahmad to JOB-1234"
- **Then** Ahmad is assigned to the job (1 of 2 slots filled)
- **And** Ahmad receives a WhatsApp notification with job details
- **And** I receive confirmation: "Ahmad assigned to JOB-1234 (1/2 officers)"

### Scenario 2: Assign multiple officers at once

- **Given** job JOB-1234 needs 2 officers
- **When** I send "Assign Ahmad and Ravi to JOB-1234"
- **Then** both officers are assigned
- **And** both receive individual WhatsApp notifications
- **And** I receive confirmation: "Ahmad and Ravi assigned to JOB-1234 (2/2 officers)"

### Scenario 3: Officer already has an active job (concurrency block)

- **Given** Ahmad is already assigned to JOB-1111 at the same date/time
- **When** I try to assign Ahmad to JOB-1234 with overlapping time
- **Then** the system warns: "⚠️ Ahmad is already assigned to JOB-1111 (8am-6pm). Assign anyway and remove from JOB-1111?"
- **And** I choose to proceed or pick a different officer

### Scenario 4: All slots filled

- **Given** JOB-1234 needs 2 officers and already has 2 assigned
- **When** I try to assign a 3rd officer
- **Then** the system warns: "JOB-1234 already has 2/2 officers. Add an additional officer? ✅ Yes | ❌ No"

### Scenario 5: Officer not found

- **Given** I type an unrecognized name
- **When** I send "Assign John to JOB-1234"
- **Then** the system responds with suggestions: "No officer found for 'John'. Did you mean: John Tan, Johnny Lim?"

## UI/UX Notes

- Officer notification:
  ```
  📋 New Assignment:
  🆔 JOB-1234
  📍 Marina Bay Tower
  📅 24 Feb 2026
  ⏰ 08:00 – 18:00
  📝 Uniform required

  Please acknowledge: ✅ Accept | ❌ Decline
  ```
- Admin can assign by name, phone number, officer ID, or supported web selection flow
- System should show available officers on request: "Who's available on 24 Feb 8am-6pm?"

## Edge Cases

- Officer's phone is off / WhatsApp undelivered → message queued, admin notified if undelivered after 5 min
- Assign officer to job on their off-day or unavailable date → system warns clearly and requires admin confirmation or reassignment decision
- Assign same officer twice to same job → reject: "Ahmad is already assigned to JOB-1234"
- Name fuzzy matching: "Ahmad" matches "Ahmad bin Hassan" and "Ahmad Razak" → show options

## Dependencies

- US-001: Job must exist
- Officer registry (phone numbers, names, IDs)
- GreenAPI for WhatsApp message delivery
- Availability logic (1 officer = 1 active job)

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Single assignment | "Assign Ahmad to JOB-1234" | Ahmad assigned, notification sent |
| 2 | Multi assignment | "Assign Ahmad and Ravi to JOB-1234" | Both assigned, both notified |
| 3 | Concurrency block | Assign officer with overlapping job | Warning with option to reassign |
| 4 | Over-assign | Assign 3rd officer to 2-slot job | Warning with option to add |
| 5 | Unknown officer | "Assign XYZ to JOB-1234" | Suggestions shown |
| 6 | Duplicate assignment | Assign Ahmad twice to same job | Rejected |
| 7 | Available officers query | "Who's available 24 Feb 8am-6pm?" | List of available officers |

---

**Created by:** Aira · 2026-02-23
