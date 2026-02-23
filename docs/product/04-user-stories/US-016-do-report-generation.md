# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-016 |
| **Epic** | DO Reporting |
| **Feature** | Auto-Generate DO Report PDF |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 8 story points |
| **Sprint** | Sprint 4 |

---

## Story

**As an** admin,
**I want** a DO (Deployment Order) report to be automatically generated as a PDF when a job is completed,
**so that** I have immediate billing documentation without manual report creation.

## Acceptance Criteria

### Scenario 1: Auto-generation on job completion

- **Given** all officers on JOB-1234 have checked out and the job status is "Completed"
- **When** the last officer checks out
- **Then** the system auto-generates a PDF DO report within 2 minutes
- **And** admin is notified: "📋 DO Report ready for JOB-1234 — Marina Bay Tower (24 Feb)"

### Scenario 2: DO report content

- **Given** a DO report is generated for JOB-1234
- **Then** the PDF contains:
  - Job ID, site name, site address
  - Date, scheduled start/end time
  - Each officer's name, IC last 4 digits
  - Check-in time, GPS coordinates, check-in photo
  - Check-out time, GPS coordinates, check-out photo
  - All periodic photos with timestamps
  - Late check-in / missed photo flags
  - Officer remarks and incident notes (if any)
  - Signature section (blank until signed)

### Scenario 3: Multi-officer report

- **Given** JOB-1234 had 3 officers
- **When** the DO report is generated
- **Then** all 3 officers' attendance data appears in the same report
- **And** each officer has their own section with photos and timestamps

### Scenario 4: Partial completion (some officers checked out, job cancelled)

- **Given** JOB-1234 was cancelled after 2 of 3 officers checked out
- **When** the DO report is generated
- **Then** it includes the 2 officers' complete data and notes the cancellation
- **And** the 3rd officer's section shows "Job cancelled" status

### Scenario 5: Admin manually triggers report

- **Given** JOB-1234 is completed but I want to regenerate the report
- **When** I send "Generate DO report for JOB-1234"
- **Then** a fresh PDF is generated with the latest data

## UI/UX Notes

- Admin receives the PDF as a WhatsApp document attachment
- PDF should be professionally formatted with company header
- File naming: `DO-JOB1234-MarinaBayTower-20260224.pdf`
- Admin can also request: "Show me today's DO reports" → list of completed jobs with PDF links
- Photos in PDF should be thumbnails (to keep file size manageable)

## Edge Cases

- Officer has no periodic photos (short shift) → sections marked "N/A"
- GPS data missing (manual check-in override) → marked "Manual entry — no GPS"
- Very long shift with many photos → PDF may be large; limit to key photos or paginate
- Officer remarks contain special characters → sanitize for PDF rendering
- Job with no officers checked in (all no-shows, job cancelled) → generate minimal report noting cancellation

## Dependencies

- US-009: Check-in data
- US-010: Check-out data
- US-011: Periodic photo data
- PDF generation library (e.g., Puppeteer, jsPDF, or server-side rendering)
- Photo storage accessible for PDF embedding

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Auto-generation | Complete a 2-officer job (both check out) | PDF generated, admin notified |
| 2 | PDF content | Open generated PDF | All fields present and accurate |
| 3 | Multi-officer | 3 officers complete job | All 3 in report |
| 4 | Partial job | Cancel job after 1 officer checks out | Report includes partial data |
| 5 | Manual trigger | "Generate DO report for JOB-1234" | Fresh PDF generated |
| 6 | PDF file size | Job with 10+ periodic photos | PDF under 10MB |
| 7 | No GPS data | Manual check-in without GPS | Marked appropriately in PDF |

---

**Created by:** Aira · 2026-02-23
