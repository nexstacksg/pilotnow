# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-018 |
| **Epic** | DO Reporting |
| **Feature** | Email DO Report to Finance |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 5 story points |
| **Sprint** | Sprint 4 |

---

## Story

**As an** admin,
**I want** signed DO reports to be automatically emailed as PDF to the finance team,
**so that** billing can begin immediately without manual handoff.

## Acceptance Criteria

### Scenario 1: Auto-email on signature completion

- **Given** the DO report for JOB-1234 has been signed by the site manager
- **When** the signature is confirmed
- **Then** the signed PDF is emailed to the configured finance recipient
- **And** admin is notified: "📧 DO report for JOB-1234 emailed to finance@client.com"

### Scenario 2: Configurable recipient per client/job

- **Given** client "MegaCorp" has finance email set to "accounts@megacorp.com"
- **When** a MegaCorp job's DO report is signed
- **Then** the email is sent to accounts@megacorp.com
- **And** admin can override per job if needed

### Scenario 3: Admin configures finance email

- **Given** I am setting up a new client
- **When** I send "Set finance email for MegaCorp to accounts@megacorp.com"
- **Then** the email is saved for all future MegaCorp jobs
- **And** bot confirms: "✅ Finance email for MegaCorp set to accounts@megacorp.com"

### Scenario 4: Email for unsigned report (admin skipped signature)

- **Given** admin skipped the signature (US-015 Scenario 3)
- **When** admin confirms sending the unsigned report
- **Then** the PDF is emailed with subject line noting "UNSIGNED"
- **And** email body includes a note: "This DO report has not been signed by the site manager"

### Scenario 5: Admin manually triggers email

- **Given** a DO report exists for JOB-1234
- **When** I send "Email DO report JOB-1234 to accounts@megacorp.com"
- **Then** the PDF is emailed to the specified address
- **And** I receive confirmation

## UI/UX Notes

- Email subject: `DO Report — [Site Name] — [Date] — JOB-[ID]`
- Email body: brief summary (site, date, officers, signed/unsigned status)
- PDF attached to email
- Admin can also send to multiple recipients: "Email JOB-1234 report to finance@client.com and ops@client.com"
- CC admin on all finance emails (configurable)

## Edge Cases

- Email delivery fails → retry 3 times over 30 min, alert admin if all fail
- Finance email not configured for client → admin prompted to set it before sending
- Very large PDF attachment (>10MB) → compress images, or send download link instead
- Multiple DO reports for same client on same day → each sent individually (not batched in MVP)

## Dependencies

- US-016: DO report generation
- US-017: Digital signature (or skip)
- Email service (SendGrid, SES, or similar)
- Client registry with finance email configuration

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Auto-email after signing | Sign DO report → email sent automatically | PDF received at finance email |
| 2 | Custom recipient | Configure client email, complete job | Email goes to configured address |
| 3 | Unsigned report email | Skip signature → send report | Email sent with "UNSIGNED" subject |
| 4 | Manual email trigger | "Email DO report JOB-1234 to x@y.com" | PDF emailed to specified address |
| 5 | No finance email configured | Complete job for client without email set | Admin prompted to configure |
| 6 | Email delivery failure | Simulate email failure | Retry 3 times, admin alerted |
| 7 | Multiple recipients | "Email to a@b.com and c@d.com" | Both receive the PDF |

---

**Created by:** Aira · 2026-02-23
