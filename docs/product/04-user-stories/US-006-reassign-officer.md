# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-006 |
| **Epic** | Officer Assignment |
| **Feature** | Reassign Officer |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 5 story points |
| **Sprint** | Sprint 2 |

---

## Story

**As an** admin,
**I want** to reassign an officer on a job (replace one officer with another) via WhatsApp,
**so that** I can handle no-shows, cancellations, or staffing changes quickly.

## Acceptance Criteria

### Scenario 1: Replace officer on an open/assigned job

- **Given** JOB-1234 has Ahmad assigned
- **When** I send "Replace Ahmad with Ravi on JOB-1234"
- **Then** Ahmad is removed from JOB-1234 and notified: "You have been unassigned from JOB-1234"
- **And** Ravi is assigned and receives the standard assignment notification
- **And** I receive confirmation of the swap

### Scenario 2: Reassign during a no-show escalation

- **Given** admin receives a no-show alert for Ahmad on JOB-1234
- **When** the bot offers reassignment options
- **Then** admin can pick a replacement from available officers
- **And** the replacement officer is notified immediately

### Scenario 3: Remove officer without replacement

- **Given** JOB-1234 has Ahmad and Ravi assigned
- **When** I send "Remove Ahmad from JOB-1234"
- **Then** Ahmad is unassigned and notified
- **And** job shows 1/2 officers filled
- **And** I am reminded: "JOB-1234 now has 1/2 officers. Assign a replacement?"

### Scenario 4: Replacement officer has a conflict

- **Given** Ravi is already assigned to another job at the same time
- **When** I try to assign Ravi as replacement
- **Then** the bot warns about the conflict (same as US-005 Scenario 3)

## UI/UX Notes

- Reassignment notification to removed officer should be respectful: "Your assignment to JOB-1234 has been updated. No action needed."
- Replacement officer gets full job details as a fresh assignment notification
- Admin can also just remove without replacement ("Remove Ahmad from JOB-1234")

## Edge Cases

- Reassign officer who has already checked in → warn admin, auto check-out removed officer with reason "Reassigned"
- Replacement officer declines → admin is alerted, job still needs filling
- Reassign on a job that has started → new officer gets immediate check-in prompt

## Dependencies

- US-005: Assignment system
- US-007: Acknowledgement system
- No-show escalation flow (US-013)

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Swap officers | "Replace Ahmad with Ravi on JOB-1234" | Ahmad removed, Ravi assigned, both notified |
| 2 | Remove only | "Remove Ahmad from JOB-1234" | Ahmad removed, admin reminded of unfilled slot |
| 3 | Reassign checked-in officer | Replace officer who already checked in | Warning, auto check-out with reason |
| 4 | Replacement has conflict | Assign busy officer as replacement | Conflict warning shown |

---

**Created by:** Aira · 2026-02-23
