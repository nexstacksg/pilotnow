# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-014 |
| **Epic** | Escalation |
| **Feature** | Missed Photo Escalation |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 3 story points |
| **Sprint** | Sprint 3 |

---

## Story

**As an** admin,
**I want** to be alerted immediately when an officer misses a periodic photo submission,
**so that** I can follow up and ensure continuous site presence.

## Acceptance Criteria

### Scenario 1: Missed photo alert to admin

- **Given** Ahmad was due for a periodic photo at 10:00 for JOB-1234
- **When** 15 minutes pass with no photo submitted (10:15)
- **Then** admin receives:
  ```
  ⚠️ Missed Photo:
  👤 Ahmad (JOB-1234)
  📍 Marina Bay Tower
  📸 Due: 10:00 (15 min overdue)

  📞 Call Ahmad | ⏳ Wait
  ```

### Scenario 2: Officer submits photo after alert

- **Given** admin was alerted about Ahmad's missed photo
- **When** Ahmad submits a photo at 10:20
- **Then** admin is notified: "✅ Ahmad submitted late photo for JOB-1234 (20 min late)"
- **And** the photo is stored with timestamp

### Scenario 3: Repeated missed photos

- **Given** Ahmad missed 2 consecutive periodic photos
- **When** the second miss is detected
- **Then** the admin alert escalates in urgency: "🚨 Ahmad missed 2 consecutive photos at Marina Bay Tower. Officer may have left site."

## UI/UX Notes

- Alert is lower severity than no-show (⚠️ vs 🚨) unless repeated
- Admin can dismiss or act on each alert individually
- Missed photo count tracked per shift for reporting

## Edge Cases

- Officer sends photo just as the 15-min timer fires → race condition: accept photo, suppress alert if within seconds
- Officer sends photo to wrong chat → not received by system, counts as missed
- Network delay on officer's photo → use message timestamp, not receipt time

## Dependencies

- US-011: Periodic photo reminders
- Scheduler for missed photo detection
- Admin notification system

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Missed photo alert | Don't respond to periodic reminder for 15 min | Admin alerted |
| 2 | Late photo after alert | Submit photo 20 min late | Admin notified of late submission |
| 3 | Consecutive misses | Miss 2 photos in a row | Escalated alert |
| 4 | Just-in-time photo | Submit photo at exactly 15 min | Photo accepted, no alert |

---

**Created by:** Aira · 2026-02-23
