# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-010 |
| **Epic** | Attendance & Proof |
| **Feature** | Check-Out |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 5 story points |
| **Sprint** | Sprint 3 |

---

## Story

**As a** security officer,
**I want** to check out of my job by sending a photo with my GPS location,
**so that** my shift end time is recorded accurately for attendance and billing.

## Acceptance Criteria

### Scenario 1: Successful check-out

- **Given** I am checked in to JOB-1234 and my shift is ending
- **When** I send a photo with location within the site's GPS radius
- **Then** the system records my check-out with timestamp, GPS, and photo
- **And** I receive: "✅ Checked out of JOB-1234. Shift: 08:02 – 18:05. Thank you!"
- **And** my status becomes "Available" for future assignments

### Scenario 2: Check-out prompted at shift end

- **Given** my shift end time is 18:00
- **When** the clock reaches 18:00
- **Then** I receive: "⏰ Your shift at Marina Bay Tower is ending. Please check out by sending a 📸 photo with your 📍 location."

### Scenario 3: Early check-out

- **Given** my shift ends at 18:00 and it's 16:00
- **When** I try to check out early
- **Then** the system asks: "Your shift ends at 18:00. Check out early? ✅ Yes | ❌ No"
- **And** if confirmed, records check-out at 16:00 with "Early" flag
- **And** admin is notified of early check-out

### Scenario 4: No check-out after shift end

- **Given** my shift ended 30 minutes ago and I haven't checked out
- **When** the system detects the missed check-out
- **Then** I receive a reminder: "⚠️ Please check out of JOB-1234"
- **And** after 1 hour past shift end, admin is alerted

### Scenario 5: Check-out outside GPS radius

- **Given** I am outside the site's GPS radius at check-out time
- **When** I send photo + location
- **Then** the system accepts check-out but flags it: "⚠️ Check-out recorded but your location is 300m from site"
- **And** admin is notified of the location discrepancy

## UI/UX Notes

- Check-out follows same photo + location flow as check-in
- Check-out confirmation shows total shift duration
- End-of-shift prompt should be sent at shift end time
- If officer has remarks or incidents, they can add them: "Any remarks? Reply with notes or send 'No'"

## Edge Cases

- Officer checks out and then admin extends the job → officer must be re-checked-in or assigned fresh
- Officer's phone dies during shift → admin can do manual check-out with timestamp
- Multiple check-out attempts → only first successful one recorded
- Check-out without prior check-in → reject: "You haven't checked in to any active job"

## Dependencies

- US-009: Check-in must exist
- US-008: Shift end prompt
- GreenAPI for photo + location reception

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Valid check-out | Send photo + location at shift end | Check-out recorded with duration |
| 2 | Early check-out | Check out 2hrs early, confirm | Recorded with "Early" flag, admin notified |
| 3 | Missed check-out | Don't check out for 30 min | Reminder sent |
| 4 | Outside radius | Check out from 300m away | Accepted with flag, admin notified |
| 5 | No prior check-in | Try to check out without checking in | Rejected |
| 6 | Check-out prompt | Wait for shift end time | Prompt received |

---

**Created by:** Aira · 2026-02-23
