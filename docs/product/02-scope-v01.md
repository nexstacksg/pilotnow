# Scope v0.1

| Field | Value |
|-------|-------|
| **Project** | PilotNow |
| **Client** | NexStack Pte Ltd |
| **Version** | 0.1 |
| **Date** | 2026-02-23 |
| **Author** | Aira Ling |

---

## 1. Project Summary

We are building a WhatsApp-first workforce management system for security manpower companies. PilotNow will enable admins to create jobs via natural language WhatsApp messages (parsed by LLM), assign officers, track GPS-verified attendance with photo proof, and auto-generate DO reports for billing — replacing manual WhatsApp group chats, phone calls, and paper-based processes. Target launch: 8 weeks.

## 2. Scope

### In Scope

| # | Feature / Capability | Notes |
|---|----------------------|-------|
| 1 | Job creation via WhatsApp | Admin sends free-form text, LLM parses into structured job |
| 2 | Officer assignment | Admin-driven, multi-officer per job, no concurrency |
| 3 | GPS + photo check-in | 100m default radius, configurable per site |
| 4 | Periodic photo reminders | Frequency per job type, missed = admin alert |
| 5 | No-show detection & escalation | Automated alert after 10 min, admin can reassign |
| 6 | DO report generation | Auto PDF with full proof, timestamps, GPS, photos |
| 7 | Digital signature | Web link, verified by mobile + IC last 4 digits, 1hr timeout |
| 8 | Email delivery | DO report PDF to finance, configurable per job/client |
| 9 | Recurring jobs | Same site, same time, weekly schedule |

### Out of Scope

| Item | Reason |
|------|--------|
| Web admin dashboard | Phase 2 |
| Native mobile app | WhatsApp-first for MVP |
| Payroll / salary automation | Phase 2 |
| Advanced analytics & reporting | Phase 2 |
| Multi-language support | Not required for initial market |
| Finance acknowledgement tracking | Not needed for MVP |
| Officer self-selection / bidding | Admin-driven assignment model |

## 3. Key Features (High-Level)

1. **LLM Job Parsing** — Admin types job details in natural language via WhatsApp. LLM extracts site, date, time, officer count, and requirements into structured data. Admin confirms before creation.

2. **Admin-Driven Assignment** — Admin selects and assigns officers to jobs. Officers receive WhatsApp notifications and acknowledge. One officer can only work one job at a time.

3. **GPS-Verified Attendance** — Officers submit photo + location for check-in. System validates GPS within configurable radius (default 100m). All proof timestamped and stored.

4. **Automated Escalation** — If officer doesn't check in within 10 minutes of job start, admin is alerted automatically. Missed periodic photos also trigger immediate alerts. Admin can reassign.

5. **DO Report & Digital Signature** — PDF report auto-generated on shift end with full audit trail. Signature link sent to site manager, verified by mobile + IC last 4 digits. 1-hour timeout with escalation.

6. **Finance Email Delivery** — Signed DO report PDF emailed to finance team. Recipient configurable per job or client.

7. **Recurring Jobs** — Support for weekly recurring jobs (same site, same schedule) to reduce repetitive job creation.

## 4. Assumptions & Dependencies

### Assumptions

- All officers use WhatsApp with GPS-enabled smartphones
- GreenAPI WhatsApp Business API account already approved
- Security companies willing to adopt WhatsApp-based workflow
- Site managers will cooperate with digital signature process

### Dependencies

- GreenAPI account setup and phone number configuration
- LLM service selection and API access
- Email service for DO report delivery
- Hosting infrastructure provisioned

## 5. Estimated Size & Timeline

| Attribute | Estimate |
|-----------|----------|
| **Size** | M (Medium) |
| **Duration** | 8 weeks |
| **Budget** | 50K SGD |
| **Team** | TBD |
| **Sprints** | 4 × two-week sprints |

| Sprint | Weeks | Focus |
|--------|-------|-------|
| Sprint 1 | 1–2 | Infrastructure, GreenAPI setup, LLM integration |
| Sprint 2 | 3–4 | Job creation, assignment, notification flows |
| Sprint 3 | 5–6 | Attendance, GPS check-in, photo proof, escalation |
| Sprint 4 | 7–8 | DO reporting, signature, email delivery, E2E testing |

## 6. Risks & Open Questions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| GreenAPI rate limits hit during broadcast | Medium | High | Implement queuing and retry logic |
| GPS accuracy issues in buildings/underground | High | Medium | Configurable radius per site, manual override option |
| LLM parsing errors on ambiguous input | Medium | Medium | Admin confirmation step before job creation |
| Site manager ignores signature link | Medium | High | 1hr timeout + escalation to admin |
| Officer smartphone issues (old device, no GPS) | Low | Medium | Graceful fallback, admin manual entry |

### Resolved Questions

- ✅ Budget: 50K SGD for MVP
- ✅ Pilot scale: 1,000 officers / jobs per day
- ✅ PDPA: Not required for MVP
- ✅ Shifts: Flexible, not fixed timing (not "3 shift max" — shifts are variable duration)
- ✅ Recurring jobs: Supports both natural language and structured input
- ✅ Tech stack: Hono.js, PostgreSQL, DigitalOcean
- ✅ LLM: Google Gemini + OpenAI

---

## Approval

| Approver | Role | Status | Date | Notes |
|----------|------|--------|------|-------|
| Ken | Product Owner | ✅ Approved | 2026-02-23 | |

**Status legend:** ⬜ Pending · ✅ Approved · 🔄 Revisions Requested · ❌ Rejected

---

**Next step:** On approval → [03-prd.md](03-prd.md)
