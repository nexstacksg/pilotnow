# Scope v0.2

| Field | Value |
|-------|-------|
| **Project** | PilotNow |
| **Client** | NexStack Pte Ltd |
| **Version** | 0.2 |
| **Date** | 2026-05-12 |
| **Author** | Aira Ling |

---

## 1. Project Summary

PilotNow is a workforce operations platform for security manpower companies, designed around WhatsApp-first field execution and supported by structured back-office operations, reporting, compliance, and billing workflows. The product must cover the full operational lifecycle: client/site setup, job intake, planning, assignment, attendance verification, escalation handling, incident capture, DO reporting, signature collection, finance handoff, and operational visibility.

The earlier MVP framing is no longer the target for this document. This scope defines the **full baseline product requirement**. Sequencing can still be phased during delivery, but the requirement set should describe the complete operating model from end to end.

## 2. Product Scope

### In Scope

| # | Capability Area | Scope Detail |
|---|-----------------|-------------|
| 1 | Lead / job intake | Job requests via WhatsApp, structured admin entry, recurring schedules, amendments, cancellations |
| 2 | Master data management | Clients, sites, site managers, officers, job types, finance recipients, operating rules |
| 3 | Planning & scheduling | Single and recurring jobs, manpower requirement planning, conflict checks, replacements, shift coverage visibility |
| 4 | Assignment operations | Admin assignment, acknowledgement tracking, reassignment, standby handling, assignment audit trail |
| 5 | Field execution | Check-in, periodic proof-of-presence, checkout, incident/remark logging, early/late status tracking |
| 6 | GPS & proof validation | Site radius rules, geocoding, accuracy handling, manual review / override workflow, evidence retention |
| 7 | Escalation engine | No-show, missed photo, late checkout, failed delivery, signature timeout, exception routing |
| 8 | DO reporting | Automated DO report assembly, partial reports, unsigned handling, officer-by-officer audit history |
| 9 | Digital signature workflow | Signature request, verification, expiry, resend, fallback share flow, tamper-evident signed output |
| 10 | Finance handoff | Email delivery, recipient rules, resend, bounce handling, download/share fallback |
| 11 | Admin operations console | Job monitoring, exception review, evidence lookup, status visibility, search and filter views |
| 12 | Reporting & audit | Operational logs, job history, attendance history, incident logs, exportable reporting, audit trace |
| 13 | Security & compliance | Access control, encrypted storage/transit, retention rules, PDPA-aware data handling, auditability |
| 14 | Platform integrations | GreenAPI, LLM parsing, maps/geocoding, email, file storage, monitoring/alerting |

### Delivery Sequencing Note

This scope is intentionally written as the full requirement set. Implementation can be phased, but the following items are **not excluded from product scope**:

- Admin web / operations console
- Advanced reporting and audit visibility
- Finance acknowledgement / delivery traceability
- Officer master-data lifecycle management
- Compliance, retention, and security controls
- Manual exception handling paths for operational edge cases

## 3. End-to-End Product Flow

1. **Master data setup**  
   Admin configures clients, sites, site managers, job types, officers, escalation rules, finance recipients, and site radius settings.

2. **Job intake**  
   Admin receives customer job requests and creates jobs via WhatsApp or structured entry. System parses, validates, detects duplicates/conflicts, and stores jobs.

3. **Planning and assignment**  
   Admin assigns officers, tracks acknowledgement, handles unavailability, and resolves staffing conflicts before shift start.

4. **Pre-shift readiness**  
   Officers receive reminders and job details. Admin sees unacknowledged, understaffed, or exception-risk jobs before start time.

5. **Live field execution**  
   Officers check in with proof, respond to periodic reminders, log incidents/remarks, and check out at shift end.

6. **Exception handling**  
   System escalates no-shows, missed proof requests, failed deliveries, GPS anomalies, and signature delays; admins resolve or override where needed.

7. **Report closure**  
   System generates DO reports with full audit trail, routes them for site sign-off, and preserves signed/unsigned outcomes.

8. **Finance and audit follow-through**  
   Final reports are delivered to finance recipients, delivery is tracked, and all operational evidence remains available for audit and dispute handling.

## 4. Key Product Requirements (High-Level)

1. **Multi-channel job intake with structured normalization** — Free-form WhatsApp remains core, but the product must also support structured operational data entry and correction.
2. **Full workforce scheduling control** — The system must support assignment, acknowledgement, reassignment, recurring schedules, and staffing conflict prevention.
3. **Verifiable field attendance** — GPS, timestamp, photo, and evidence trails must be captured reliably with operational fallback paths.
4. **Real-time exception management** — Admins must be able to detect, investigate, and resolve issues before they become billing or service failures.
5. **Operational reporting and compliance** — DO reports, incidents, remarks, audit logs, and history views must support both internal ops and client-facing accountability.
6. **Finance-ready closure** — Signed or unsigned reports must move cleanly into finance workflows with traceability.
7. **Administrative visibility** — The business must be able to search, filter, review, and manage jobs, officers, clients, and exceptions beyond chat-only interactions.

## 5. Assumptions & Dependencies

### Assumptions

- Officers continue to use WhatsApp as the primary field execution channel
- Operations teams need both **chat-first execution** and **structured admin visibility**
- Site managers may sign digitally, but fallback operational handling is still required for delayed or failed signature capture
- The product must support audit and dispute review, not just day-of operations

### Dependencies

- GreenAPI account setup and production messaging reliability
- LLM service availability and confidence handling
- Maps / geocoding service for address normalization and radius validation
- Email / delivery provider for finance handoff
- Secure file storage for photos, PDFs, and signatures
- Monitoring, logging, and alerting for operational exceptions

## 6. Commercial / Delivery Context

| Attribute | Current Reference |
|-----------|-------------------|
| **Requirement framing** | Full product baseline |
| **Prior estimate** | 50K SGD MVP reference only |
| **Delivery planning** | To be re-estimated against full scope |
| **Release strategy** | Sequenced delivery allowed, but requirements remain full-scope |

## 7. Risks & Open Questions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| GreenAPI rate limits or delivery instability | Medium | High | Queueing, retry logic, alerting, operational fallback |
| GPS accuracy issues in dense / indoor sites | High | Medium | Configurable radius, evidence review, override workflow |
| LLM parsing ambiguity | Medium | Medium | Confirmation flow, structured edit path, fallback parsing |
| Signature completion delays | Medium | High | Escalation, resend, unsigned workflow, fallback share path |
| Audit / compliance gaps if evidence handling is weak | Medium | High | Retention, access controls, audit logs, PDPA-aware handling |

### Resolved Direction

- PilotNow should now be documented as a **full product requirement**, not only an MVP
- WhatsApp remains primary for field execution, but operational visibility must extend beyond chat-only interaction
- Reporting, finance handoff, compliance, and admin control are in baseline scope
- Budget / timeline must be reworked separately against the expanded requirement set

---

## Approval

| Approver | Role | Status | Date | Notes |
|----------|------|--------|------|-------|
| Ken | Product Owner | 🔄 Needs review | 2026-05-12 | Scope updated from MVP framing to full product baseline |

**Status legend:** ⬜ Pending · ✅ Approved · 🔄 Revisions Requested · ❌ Rejected

---

**Next step:** Update and align [03-prd.md](03-prd.md) to the full-scope baseline.
