# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-017 |
| **Epic** | DO Reporting |
| **Feature** | Digital Signature |
| **PRD Ref** | See PRD v2.0 |
| **Priority** | Must |
| **Size** | 8 story points |
| **Sprint** | Sprint 4 |

---

## Story

**As a** site manager,
**I want** to digitally sign a DO report via a secure web link sent to me,
**so that** I can verify the attendance record without paper forms.

## Acceptance Criteria

### Scenario 1: Signature link sent to site manager

- **Given** DO report for JOB-1234 has been generated
- **When** the system sends the signature request
- **Then** the site manager receives a WhatsApp message:
  ```
  📋 Please sign the DO Report:
  📍 Marina Bay Tower — 24 Feb 2026
  👥 Officers: Ahmad, Ravi, Siti

  🔗 Sign here: https://pilotnow.app/sign/abc123
  ⏰ Link expires in 1 hour
  ```

### Scenario 2: Successful signature with verification

- **Given** I open the signature link on my phone
- **When** I see the DO report summary and enter my mobile number + IC last 4 digits
- **Then** the system verifies my mobile matches the registered site manager
- **And** I can draw/tap my signature on the screen
- **And** upon submission, the DO report is marked as "Signed"
- **And** admin is notified: "✅ DO report for JOB-1234 signed by David Tan"

### Scenario 3: Verification fails (wrong IC digits)

- **Given** I enter an incorrect IC last 4 digits
- **When** I submit
- **Then** I see "Verification failed. Please check your IC number and try again."
- **And** I get 3 attempts before the link is locked
- **And** admin is notified of failed verification attempts

### Scenario 4: Signature link expired

- **Given** the signature link was sent 1 hour ago
- **When** I open the link
- **Then** I see "This link has expired. Please contact the admin for a new link."
- **And** admin is alerted (US-015)

### Scenario 5: Signature on read-only report

- **Given** I open the signature link
- **When** the page loads
- **Then** I can see the full DO report summary (officers, times, photos) in read-only format
- **And** the signature section is at the bottom with verification fields

## UI/UX Notes

- Signature page is a mobile-optimized web page (not WhatsApp — external link)
- Flow: Open link → View report summary → Enter mobile + IC last 4 → Draw signature → Submit
- Signature input: touch-draw canvas on mobile (finger signature)
- Page must load fast on mobile data — minimal assets
- Show clear success confirmation after signing with a green checkmark
- No app download or account creation required

## Edge Cases

- Site manager opens link on desktop → should still work, mouse signature
- Multiple site managers for one site → link sent to the configured contact
- Site manager shares link with someone else → verification (mobile + IC) prevents unauthorized signing
- Browser back button after signing → show "Already signed" instead of allowing re-sign
- Slow mobile connection → signature page should be <200KB total
- Site manager has no WhatsApp → admin can share the link manually via SMS or other channel

## Dependencies

- US-016: DO report must be generated
- Web page hosting (DigitalOcean)
- Site manager registry (mobile, IC last 4)
- Short URL or unique token generation for signature links

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Successful signature | Open link → verify → sign → submit | Report marked signed, admin notified |
| 2 | Wrong IC digits | Enter wrong IC | Error message, can retry |
| 3 | 3 failed attempts | Enter wrong IC 3 times | Link locked, admin notified |
| 4 | Expired link | Open link after 1 hour | Expired message shown |
| 5 | View report | Open link and review report | All job details visible |
| 6 | Re-open after signing | Open signed link again | "Already signed" shown |
| 7 | Mobile responsive | Open on various phone screens | Page displays correctly |
| 8 | Desktop signature | Open on desktop, sign with mouse | Works correctly |

---

**Created by:** Aira · 2026-02-23
