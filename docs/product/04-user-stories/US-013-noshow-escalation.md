# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-013 |
| **Epic** | Escalation |
| **Feature** | No-Show Detection & Escalation |
| **PRD Ref** | See PRD v2.0 |
| **Priority** | Must |
| **Size** | 5 story points |
| **Sprint** | Sprint 3 |

---

## Story

**As an** admin,
**I want** to be automatically alerted when an officer doesn't check in within 10 minutes of shift start,
**so that** I can take immediate action — contact the officer or assign a replacement.

## Acceptance Criteria

### Scenario 1: No-show detected at 10 minutes

- **Given** Ahmad is assigned to JOB-1234 starting at 08:00
- **When** it is 08:10 and Ahmad has not checked in
- **Then** admin receives an alert:
  ```
  🚨 No-Show Alert:
  👤 Ahmad (JOB-1234)
  📍 Marina Bay Tower
  ⏰ Shift started: 08:00 (10 min ago)

  📞 Call Ahmad | 🔄 Reassign | ⏳ Wait
  ```
- **And** Ahmad receives: "⚠️ You haven't checked in to JOB-1234. Please check in immediately or contact your admin."

### Scenario 2: Admin chooses to reassign

- **Given** admin received a no-show alert for Ahmad
- **When** admin taps "🔄 Reassign"
- **Then** the system shows available officers for the same time slot
- **And** admin selects a replacement → standard assignment flow (US-006)

### Scenario 3: Admin chooses to wait

- **Given** admin received a no-show alert
- **When** admin taps "⏳ Wait"
- **Then** the system waits another 10 minutes
- **And** if still no check-in at 08:20, a second escalation is sent: "🚨 Ahmad still not checked in (20 min late). Reassign now?"

### Scenario 4: Officer checks in late (after no-show alert)

- **Given** a no-show alert was sent for Ahmad at 08:10
- **When** Ahmad checks in at 08:12
- **Then** admin is notified: "✅ Ahmad checked in late to JOB-1234 (12 min late)"
- **And** the late check-in is recorded with the actual timestamp

### Scenario 5: Multiple officers no-show on same job

- **Given** JOB-1234 has 3 officers and 2 are no-shows
- **When** 08:10 arrives with 2 officers not checked in
- **Then** admin receives a consolidated alert listing both no-shows
- **And** can reassign each individually

## UI/UX Notes

- No-show alert is high-priority: uses 🚨 emoji, clear formatting
- Action buttons: Call (opens phone dialer link), Reassign, Wait
- "Call Ahmad" could be a `tel:` link or just show the phone number
- Second escalation after "Wait" is more urgent in tone
- Admin can also proactively check: "Status JOB-1234" → shows who's checked in and who hasn't

## Edge Cases

- Officer's WhatsApp message was delayed (sent at 07:58 but received at 08:12) → check timestamp of officer's message, not receipt time
- Admin already contacted officer outside the system → admin can dismiss the alert
- All officers no-show → alert suggests cancelling or full reassignment
- No-show on a recurring job → same escalation per instance
- Officer assigned at 08:05 for 08:00 job → adjust no-show timer (10 min from assignment, not shift start)

## Dependencies

- US-009: Check-in system
- US-006: Reassignment flow
- Scheduler for 10-minute timer
- Officer contact info (phone numbers)

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | No-show at 10 min | Assign officer, don't check in for 10 min | Admin alerted, officer warned |
| 2 | Reassign from alert | Tap Reassign on no-show alert | Available officers shown, can assign |
| 3 | Wait then re-alert | Tap Wait, don't check in for 10 more min | Second escalation sent |
| 4 | Late check-in | Check in at 08:12 after no-show alert | Admin notified of late check-in |
| 5 | Multiple no-shows | 2 of 3 officers don't check in | Consolidated alert |
| 6 | Check job status | Admin sends "Status JOB-1234" | Shows check-in status per officer |

---

**Created by:** Aira · 2026-02-23
