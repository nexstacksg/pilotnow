# User Story

| Field | Value |
|-------|-------|
| **Story ID** | US-015 |
| **Epic** | Escalation |
| **Feature** | Signature Timeout Escalation |
| **PRD Ref** | — |
| **Priority** | Must |
| **Size** | 3 story points |
| **Sprint** | Sprint 4 |

---

## Story

**As an** admin,
**I want** to be alerted when a site manager hasn't signed the DO report within 1 hour,
**so that** I can follow up and prevent billing delays.

## Acceptance Criteria

### Scenario 1: Signature timeout alert

- **Given** a DO report signature link was sent to the site manager at 18:05
- **When** 1 hour passes without signature (19:05)
- **Then** admin receives:
  ```
  ⚠️ Signature Pending:
  📋 JOB-1234 — Marina Bay Tower
  🔗 Signature link sent: 18:05 (1hr ago)
  👤 Site Manager: David Tan

  📞 Call David | 🔄 Resend Link | ⏭️ Skip Signature
  ```

### Scenario 2: Admin resends signature link

- **Given** admin received a signature timeout alert
- **When** admin taps "🔄 Resend Link"
- **Then** a new signature link is sent to the site manager (new 1hr timeout)
- **And** admin receives confirmation

### Scenario 3: Admin skips signature

- **Given** admin received a timeout alert
- **When** admin taps "⏭️ Skip Signature"
- **Then** the DO report is finalized without signature, marked as "Unsigned"
- **And** the PDF is still generated and can be sent to finance

### Scenario 4: Site manager signs after alert but before action

- **Given** admin was alerted at 19:05 about pending signature
- **When** site manager signs at 19:10
- **Then** admin is notified: "✅ DO report for JOB-1234 signed by David Tan"
- **And** the alert is resolved

## UI/UX Notes

- Timeout alert includes quick actions: Call, Resend, Skip
- "Skip Signature" should require confirmation: "Skip signature? The DO report will be marked as Unsigned. ✅ Yes | ❌ No"
- Resend creates fresh link (old link still works if used before new timeout)

## Edge Cases

- Site manager's phone number is wrong → link undeliverable, admin must manually share
- Multiple resends → each creates new timeout, but all links work
- Signature link opened but not completed → still counts as unsigned until submitted

## Dependencies

- US-017: DO report digital signature
- Scheduler for 1hr timeout
- Admin notification system

## Test Scenarios (for QA)

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| 1 | Timeout alert | Wait 1hr after signature link sent | Admin alerted |
| 2 | Resend link | Tap Resend on timeout alert | New link sent, new timeout |
| 3 | Skip signature | Tap Skip → Confirm | DO report marked "Unsigned" |
| 4 | Late signature | Sign after timeout alert | Admin notified, alert resolved |
| 5 | Sign before timeout | Sign within 1 hour | No alert triggered |

---

**Created by:** Aira · 2026-02-23
