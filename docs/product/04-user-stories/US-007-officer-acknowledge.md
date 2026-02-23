# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-007 |
| **Epic** | Officer Assignment |
| **Feature** | Officer Acknowledgement |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 5 story points |
| **Sprint** | Sprint 2 |

---

## Story

**As a** security officer,
**I want** to acknowledge or decline a job assignment via WhatsApp,
**so that** my admin knows I've received and accepted the assignment.

## Acceptance Criteria

### Scenario 1: Officer accepts assignment

- **Given** I receive a job assignment notification on WhatsApp
- **When** I tap "✅ Accept" or reply "Accept"
- **Then** my assignment status changes to "Acknowledged"
- **And** I receive: "✅ Confirmed! You're assigned to JOB-1234 at Marina Bay Tower on 24 Feb, 08:00–18:00. We'll remind you before your shift."
- **And** admin is notified: "Ahmad acknowledged JOB-1234"

### Scenario 2: Officer declines assignment

- **Given** I receive a job assignment notification
- **When** I tap "❌ Decline" or reply "Decline"
- **Then** my assignment is removed
- **And** admin is immediately notified: "⚠️ Ahmad declined JOB-1234. 1/2 officers remaining. Assign replacement?"
- **And** the job slot opens up

### Scenario 3: No response within timeout

- **Given** I received an assignment notification 30 minutes ago
- **When** I have not responded
- **Then** admin is alerted: "⚠️ Ahmad has not acknowledged JOB-1234 (sent 30 min ago)"
- **And** my assignment remains but is flagged as "Pending"

### Scenario 4: Officer receives updated job details

- **Given** I already acknowledged JOB-1234
- **When** the admin edits the job (time/site change)
- **Then** I receive updated details and must re-acknowledge
- **And** my status resets to "Pending" until I respond

## UI/UX Notes

- Assignment message uses WhatsApp quick reply buttons: ✅ Accept | ❌ Decline
- Confirmation message includes full job details and a reminder note
- Officers should be able to view their current assignment: reply "My job" → bot shows active assignment
- Keep messages short and scannable — officers are on mobile

## Edge Cases

- Officer replies with unrecognized text (e.g., "OK") → bot asks "Did you mean Accept? ✅ Accept | ❌ Decline"
- Officer tries to accept after admin has already reassigned → "This assignment has been updated. Please check your latest messages."
- Officer accepts two rapid notifications (race condition) → only the latest assignment is active
- Decline reason: bot optionally asks "Any reason?" but doesn't require it

## Dependencies

- US-005: Officer assignment
- GreenAPI WhatsApp delivery + read receipts
- Officer contact registry

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Accept via button | Tap ✅ Accept on assignment notification | Status = Acknowledged, admin notified |
| 2 | Accept via text | Reply "Accept" | Same as button |
| 3 | Decline | Tap ❌ Decline | Assignment removed, admin notified |
| 4 | No response 30 min | Wait 30 min without responding | Admin alerted |
| 5 | Ambiguous reply | Reply "OK" | Bot clarifies with buttons |
| 6 | Re-acknowledge after edit | Admin edits job → officer gets updated notification | Must re-acknowledge |
| 7 | View active assignment | Officer sends "My job" | Bot shows current assignment details |

---

**Created by:** Aira · 2026-02-23
