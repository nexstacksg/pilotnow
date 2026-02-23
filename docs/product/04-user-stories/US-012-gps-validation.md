# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-012 |
| **Epic** | Attendance & Proof |
| **Feature** | GPS Validation & Site Configuration |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 3 story points |
| **Sprint** | Sprint 3 |

---

## Story

**As an** admin,
**I want** to configure GPS radius per site for attendance validation,
**so that** check-in accuracy accommodates different site environments (open area vs underground).

## Acceptance Criteria

### Scenario 1: Configure site GPS radius

- **Given** I am setting up a new site "Underground Carpark B2"
- **When** I set the GPS radius to 200m (instead of default 100m)
- **Then** all check-ins at this site validate against 200m radius

### Scenario 2: Default radius applied

- **Given** a site has no custom radius configured
- **When** an officer checks in
- **Then** the system uses the default 100m radius

### Scenario 3: Admin updates site radius

- **Given** site "Marina Bay Tower" currently has 100m radius
- **When** I send "Set Marina Bay Tower radius to 150m"
- **Then** the radius is updated for all future check-ins at that site

## UI/UX Notes

- Site configuration via WhatsApp: "Set up site [name]" → bot prompts for address, GPS coordinates, radius
- Admin can also update just the radius: "Set [site] radius to [X]m"
- GPS coordinates can be set by admin sharing a location pin on WhatsApp

## Edge Cases

- Very large radius (>500m) → warn admin: "Large radius may reduce accuracy. Confirm?"
- Very small radius (<20m) → warn admin: "Small radius may cause check-in issues. Confirm?"
- Site without GPS coordinates → check-in accepted without GPS validation, flagged for admin

## Dependencies

- Site registry in PostgreSQL
- GPS calculation logic (Haversine formula)

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Custom radius | Set site to 200m, check in from 150m | Check-in succeeds |
| 2 | Default radius | No custom radius, check in from 80m | Check-in succeeds |
| 3 | Default radius reject | No custom radius, check in from 120m | Check-in rejected |
| 4 | Update radius | Change from 100m to 150m, check in from 120m | Check-in succeeds |
| 5 | Large radius warning | Set radius to 600m | Warning shown |

---

**Created by:** Aira · 2026-02-23
