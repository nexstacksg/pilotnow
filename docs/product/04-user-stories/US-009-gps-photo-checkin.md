# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-009 |
| **Epic** | Attendance & Proof |
| **Feature** | GPS + Photo Check-In |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 8 story points |
| **Sprint** | Sprint 3 |

---

## Story

**As a** security officer,
**I want** to check in to my job by sending a photo with my GPS location via WhatsApp,
**so that** my attendance is verified with proof of presence at the site.

## Acceptance Criteria

### Scenario 1: Successful check-in within GPS radius

- **Given** I am assigned to JOB-1234 at Marina Bay Tower and my shift has started
- **When** I send a photo with location sharing to the bot, and my GPS is within 100m of the site
- **Then** the system records my check-in with timestamp, GPS coordinates, and photo
- **And** I receive: "✅ Checked in to JOB-1234 at Marina Bay Tower. Time: 08:02. Have a good shift!"
- **And** admin is notified (or can query check-in status)

### Scenario 2: Check-in outside GPS radius

- **Given** my GPS location is more than 100m from the site
- **When** I send a photo with location
- **Then** I receive: "⚠️ Your location is too far from Marina Bay Tower (250m away, max 100m). Please move closer and try again."
- **And** check-in is NOT recorded
- **And** admin is NOT notified (yet) — officer can retry

### Scenario 3: Photo without location

- **Given** I send a photo but without location data
- **When** the system processes my message
- **Then** I receive: "📍 Please share your location along with the photo. Send location → then photo, or enable location sharing."

### Scenario 4: Location without photo

- **Given** I share my location but don't send a photo
- **When** the system processes my message
- **Then** I receive: "📸 Almost there! Please also send a photo of yourself at the site."

### Scenario 5: Check-in before shift starts

- **Given** my shift starts at 08:00 and it's currently 07:30
- **When** I try to check in
- **Then** the system accepts early check-in (within 30 min before shift)
- **And** records actual check-in time as 07:30

### Scenario 6: Site with custom GPS radius

- **Given** the site "Underground Carpark B2" has a configured radius of 200m (due to GPS inaccuracy underground)
- **When** I check in from 150m away
- **Then** the check-in succeeds (within 200m configured radius)

## UI/UX Notes

- Check-in flow: Officer sends photo → shares location (or vice versa, system accepts both orders)
- Alternatively: Officer sends photo with WhatsApp location attachment in single message
- Success confirmation is immediate and friendly
- GPS validation happens server-side by comparing officer's coordinates with site coordinates
- Bot should guide officers who are confused: "To check in, send a selfie photo and share your live location"

## Edge Cases

- GPS spoofing → MVP does not detect; future: cross-reference with cell tower data
- Officer sends multiple photos → only first photo used for check-in, others stored as supplementary
- Officer checks in to wrong job (has upcoming job too) → check in applies to the currently active/started job
- GPS accuracy very low (>500m uncertainty) → warn officer: "GPS signal weak. Move outdoors and try again."
- Officer already checked in → "You're already checked in to JOB-1234 at 08:02"
- Photo is blurry or unrecognizable → accepted in MVP (no AI photo validation)

## Dependencies

- US-005: Officer assignment
- US-008: Shift start prompt triggers check-in flow
- Site registry with GPS coordinates and radius configuration
- GreenAPI: ability to receive photos + location from WhatsApp messages
- Photo storage (DigitalOcean Spaces or similar)

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Valid check-in | Send photo + location within 100m | Check-in recorded, confirmation sent |
| 2 | Outside radius | Send photo + location 250m away | Rejected with distance info |
| 3 | Photo only | Send photo without location | Prompted for location |
| 4 | Location only | Send location without photo | Prompted for photo |
| 5 | Custom radius | Site with 200m radius, check in from 150m | Check-in succeeds |
| 6 | Early check-in | Check in 20 min before shift | Accepted with actual time |
| 7 | Duplicate check-in | Try to check in twice | "Already checked in" message |
| 8 | Weak GPS | Send location with high uncertainty | Warning to retry outdoors |

---

**Created by:** Aira · 2026-02-23
