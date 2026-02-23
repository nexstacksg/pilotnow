# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-008 |
| **Epic** | Officer Assignment |
| **Feature** | Officer Shift Reminders |
| **PRD Ref** | — |
| **Priority** | Should |
| **Size** | 3 story points |
| **Sprint** | Sprint 2 |

---

## Story

**As a** security officer,
**I want** to receive a reminder before my shift starts,
**so that** I don't forget my assignment and can arrive on time.

## Acceptance Criteria

### Scenario 1: Pre-shift reminder

- **Given** I have an acknowledged assignment for JOB-1234 starting at 08:00
- **When** it is 1 hour before my shift (07:00)
- **Then** I receive a WhatsApp reminder:
  ```
  ⏰ Reminder: Your shift starts in 1 hour
  📍 Marina Bay Tower
  ⏰ 08:00 – 18:00
  📝 Uniform required
  ```

### Scenario 2: Shift start — check-in prompt

- **Given** my shift start time has arrived (08:00)
- **When** the clock hits shift start time
- **Then** I receive a check-in prompt: "Your shift at Marina Bay Tower has started. Please check in now by sending a 📸 photo with your location."

### Scenario 3: Officer has not acknowledged — no reminder

- **Given** I was assigned but haven't acknowledged
- **When** reminder time arrives
- **Then** no reminder is sent to me (admin already alerted about non-acknowledgement)

## UI/UX Notes

- Reminders sent 1 hour before shift (configurable per deployment)
- Check-in prompt at shift start time includes clear instructions
- Messages should be concise — officers receive many WhatsApp messages

## Edge Cases

- Shift starts in less than 1 hour from assignment → skip 1hr reminder, send immediate check-in prompt at start time
- Late-night shift (e.g., 23:00) → still send reminder at 22:00
- Officer assigned to job starting in 5 minutes → send immediate prompt only

## Dependencies

- US-005: Assignment
- US-007: Acknowledgement
- Scheduler for timed message delivery
- GreenAPI

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | 1hr reminder | Job at 08:00, check at 07:00 | Reminder sent |
| 2 | Shift start prompt | Job at 08:00, check at 08:00 | Check-in prompt sent |
| 3 | Unacknowledged officer | Assign but don't acknowledge, wait for reminder time | No reminder sent |
| 4 | Late assignment | Assign at 07:45 for 08:00 job | Skip 1hr reminder, send check-in at 08:00 |

---

**Created by:** Aira · 2026-02-23
