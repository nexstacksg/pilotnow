# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-011 |
| **Epic** | Attendance & Proof |
| **Feature** | Configurable Periodic Proof & Status Prompts |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 5 story points |
| **Sprint** | Sprint 3 |

---

## Story

**As an** admin,
**I want** officers to receive configurable periodic proof prompts during their shift based on operating rules,
**so that** I have continuous proof of presence and live job status throughout the shift, not just at check-in/check-out.

## Acceptance Criteria

### Scenario 1: Officer receives periodic proof reminder

- **Given** Ahmad is checked in to JOB-1234 with a proof reminder frequency of every 1 hour
- **When** 1 hour has elapsed since check-in (or last proof response)
- **Then** Ahmad receives: "📸 Time for your shift update. Please send a live photo, your 📍 location, and your current status."

### Scenario 2: Officer submits periodic proof and status

- **Given** Ahmad received a periodic proof reminder
- **When** Ahmad sends a live photo with location within the GPS radius and selects status "On Duty"
- **Then** the response is stored with timestamp, GPS, photo, and status as proof
- **And** Ahmad receives: "✅ Update received. Next reminder in 1 hour."
- **And** the reminder timer resets

### Scenario 3: Officer misses a periodic proof request

- **Given** Ahmad received a proof reminder 15 minutes ago
- **When** Ahmad has not responded within the configured grace period
- **Then** admin is immediately alerted: "⚠️ Ahmad missed periodic proof update for JOB-1234 at Marina Bay Tower (due 10:00, now 10:15)"
- **And** Ahmad receives a follow-up: "⚠️ Reminder: Please send your live photo, location, and current status now"

### Scenario 4: Different rules by assignment type

- **Given** "Guard Duty" has 2-hour proof frequency and "Patrol" has 1-hour frequency
- **And** part-time officers at a high-risk site must always submit photo + GPS + status
- **When** officers are assigned to these respective jobs
- **Then** they receive the correct prompt interval and required evidence based on configuration

## UI/UX Notes

- Proof reminder is a simple WhatsApp message with clear instruction
- Officer submits photo + location + status using the same low-friction chat flow as check-in
- Admin alert for missed proof should include officer name, job, site, due time, and response status
- No reminder should be sent in the last 30 minutes before shift end if checkout evidence is sufficient

## Edge Cases

- Officer sends unsolicited proof between reminders → stored as supplementary evidence, timer not reset unless configuration allows it
- Officer sends photo but outside GPS radius → response stored but flagged, admin notified
- Officer sends photo without location or status → prompted for missing fields based on configured requirement
- Very short shifts (< reminder interval) → no periodic reminders, just check-in/check-out
- Officer checked out early → no more reminders sent

## Dependencies

- US-009: Check-in (timer starts at check-in)
- US-010: Check-out (timer stops at check-out)
- Operating rule configuration for proof interval and required evidence
- Scheduler for timed reminders

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Reminder sent | Check in, wait 1 hour | Proof reminder received |
| 2 | Proof submitted | Receive reminder → send photo + location + status | Response stored, timer reset |
| 3 | Missed proof | Don't respond within grace period | Admin alerted, follow-up sent |
| 4 | Different frequency | Assign to "Patrol" type (1hr frequency) | Reminder every 1 hour |
| 5 | Part-timer stricter rule | Assign part-timer to stricter site | Prompt requires configured evidence set |
| 6 | Short shift | 1.5 hour shift, 2hr frequency | No periodic reminders |
| 7 | After check-out | Check out early | No more reminders |

---

**Created by:** Aira · 2026-02-23
