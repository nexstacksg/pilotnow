# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-011 |
| **Epic** | Attendance & Proof |
| **Feature** | Periodic Photo Reminders |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 5 story points |
| **Sprint** | Sprint 3 |

---

## Story

**As an** admin,
**I want** officers to receive periodic photo reminders during their shift based on job type,
**so that** I have continuous proof of presence throughout the shift, not just at check-in/check-out.

## Acceptance Criteria

### Scenario 1: Officer receives periodic photo reminder

- **Given** Ahmad is checked in to JOB-1234 with a photo reminder frequency of every 2 hours
- **When** 2 hours have elapsed since check-in (or last photo)
- **Then** Ahmad receives: "📸 Time for a periodic photo! Please send a photo with your 📍 location."

### Scenario 2: Officer submits periodic photo

- **Given** Ahmad received a periodic photo reminder
- **When** Ahmad sends a photo with location within the GPS radius
- **Then** the photo is stored with timestamp and GPS as proof
- **And** Ahmad receives: "✅ Photo received. Next reminder in 2 hours."
- **And** the reminder timer resets

### Scenario 3: Officer misses a periodic photo

- **Given** Ahmad received a photo reminder 15 minutes ago
- **When** Ahmad has not responded within 15 minutes
- **Then** admin is immediately alerted: "⚠️ Ahmad missed periodic photo for JOB-1234 at Marina Bay Tower (due 10:00, now 10:15)"
- **And** Ahmad receives a follow-up: "⚠️ Reminder: Please send your periodic photo now"

### Scenario 4: Different frequencies per job type

- **Given** "Guard Duty" job type has 2-hour photo frequency and "Patrol" has 1-hour frequency
- **When** officers are assigned to these respective job types
- **Then** they receive photo reminders at the correct intervals

## UI/UX Notes

- Photo reminder is a simple WhatsApp message with clear instruction
- Officer just sends a photo + location — same flow as check-in
- Admin alert for missed photo should include officer name, job, site, and time
- No reminder sent in the last 30 minutes before shift end (check-out photo covers it)

## Edge Cases

- Officer sends unsolicited photos between reminders → stored as supplementary proof, timer not reset
- Officer sends photo but outside GPS radius → photo stored but flagged, admin notified
- Officer sends photo without location → prompted for location (same as check-in)
- Very short shifts (< reminder interval) → no periodic reminders, just check-in/check-out
- Officer checked out early → no more reminders sent

## Dependencies

- US-009: Check-in (timer starts at check-in)
- US-010: Check-out (timer stops at check-out)
- Job type configuration with photo frequency
- Scheduler for timed reminders

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Reminder sent | Check in, wait 2 hours | Photo reminder received |
| 2 | Photo submitted | Receive reminder → send photo + location | Photo stored, timer reset |
| 3 | Missed photo | Don't respond for 15 min | Admin alerted, follow-up sent |
| 4 | Different frequency | Assign to "Patrol" type (1hr frequency) | Reminder every 1 hour |
| 5 | Short shift | 1.5 hour shift, 2hr frequency | No periodic reminders |
| 6 | After check-out | Check out early | No more reminders |

---

**Created by:** Aira · 2026-02-23
