# Release Checklist

| Field | Value |
|-------|-------|
| **Project** | PilotNow |
| **Release** | v1.0.0 — Full Baseline Product |
| **Target Date** | TBD |
| **Release Lead** | Aira Ling |

---

## Pre-Release Gates

All items must be checked before release proceeds. Any blocker = no-go.

### 1. Requirement Completeness

- [ ] All baseline functional requirements (FR-001 to FR-023) implemented or formally deferred with signed scope note
- [ ] End-to-end operational flow validated from job intake to finance handoff
- [ ] Admin operational visibility available for live jobs, exceptions, history, and evidence lookup
- [ ] No unresolved critical business-flow gaps
- [ ] No unresolved critical security / compliance gaps

### 2. Job Intake & Scheduling

- [ ] Natural-language job parsing working reliably
- [ ] Structured correction / confirmation flow working
- [ ] Recurring jobs, exceptions, and amendments tested
- [ ] Client, site, officer, and job-type master data linked correctly
- [ ] Assignment conflict detection and reassignment flows working
- [ ] Acknowledgement tracking and reminders working

### 3. Field Execution & Evidence

- [ ] Check-in, periodic proof, and checkout flows working on real devices
- [ ] GPS validation, low-accuracy handling, and override / exception handling verified
- [ ] Photos stored reliably and retrievable for reports and audit
- [ ] Remarks and incident capture included in operational history
- [ ] Multi-officer job execution tested successfully

### 4. Escalations & Exception Handling

- [ ] No-show alerts working with reassignment path
- [ ] Missed photo alerts and escalation logic working
- [ ] Late checkout and failed proof handling working
- [ ] Messaging failure / retry behaviour verified
- [ ] Manual exception review path available to admin users

### 5. DO Reporting & Sign-Off

- [ ] DO reports generate with full evidence set
- [ ] Partial / cancelled / unsigned report scenarios handled cleanly
- [ ] Signature flow works on supported mobile browsers
- [ ] Signature expiry, resend, and lockout flows verified
- [ ] Signed report output is preserved and traceable

### 6. Finance Delivery & Traceability

- [ ] Finance email routing works per default and client-level rules
- [ ] Delivery failures and retries visible to admin
- [ ] Report delivery logs are retained for audit
- [ ] Attachment size / download fallback tested

### 7. Admin Console / Visibility

- [ ] Admin can search jobs, officers, sites, clients, and reports
- [ ] Admin can view exception queues and operational status clearly
- [ ] Admin can inspect attendance history, photos, remarks, and incidents
- [ ] Admin can resend / override supported flows where required

### 8. Security, Compliance & Audit

- [ ] Access control enforced for admin surfaces and internal APIs
- [ ] Data in transit and at rest handled securely
- [ ] PDPA-aware handling of personal data and evidence confirmed
- [ ] Audit log coverage adequate for job, assignment, attendance, signature, and delivery events
- [ ] Retention and deletion rules documented and applied

### 9. Quality Assurance

- [ ] End-to-end regression passed
- [ ] Real WhatsApp testing completed
- [ ] Real site GPS testing completed
- [ ] iOS + Android field flow testing completed
- [ ] Signature browser testing completed
- [ ] No open P1 / P2 defects

### 10. Production Readiness

- [ ] Monitoring and alerting configured
- [ ] Backup / recovery plan documented
- [ ] Operational runbook prepared
- [ ] Support / escalation ownership defined
- [ ] Production deployment verified

---

## Sign-Off

| Name | Role | Status | Notes |
|------|------|--------|-------|
| Ken Ling | Product Owner | ⬜ Pending | |
| Delivery / QA Lead | Delivery | ⬜ Pending | |

