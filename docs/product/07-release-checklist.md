# Release Checklist

| Field | Value |
|-------|-------|
| **Project** | PilotNow |
| **Release** | v1.0.0 — MVP |
| **Target Date** | Week 8 (TBD) |
| **Release Lead** | Aira Ling |

---

## Pre-Release Gates

All items must be checked before release proceeds. Any blocker = no-go.

### 1. Feature Completeness

- [ ] Job creation via WhatsApp (LLM parsing) — end-to-end
- [ ] Officer assignment and notification flow
- [ ] GPS + photo check-in with configurable radius
- [ ] Periodic photo reminders and missed-photo alerts
- [ ] No-show detection and escalation (10 min threshold)
- [ ] DO report PDF auto-generation
- [ ] Digital signature page (mobile + IC verification, 1hr timeout)
- [ ] Email delivery of signed DO report PDF
- [ ] Recurring job creation (weekly schedule)
- [ ] All acceptance criteria verified per user story
- [ ] No open Must-have bugs

**Deferred items (if any):**
- [Story ID: reason for deferral]

### 2. WhatsApp & GreenAPI Testing

- [ ] GreenAPI webhook receiving messages reliably
- [ ] Webhook retry/failure handling verified
- [ ] Inbound message parsing (text, photo, location) working
- [ ] Outbound message delivery confirmed (text, buttons, links)
- [ ] Rate limit handling tested (queuing + retry logic)
- [ ] Multiple concurrent conversations handled correctly
- [ ] Webhook signature/auth validation in place
- [ ] GreenAPI sandbox → production number switchover tested

### 3. LLM Parsing Accuracy

- [ ] Job parsing accuracy ≥ 95% on test corpus (50+ varied inputs)
- [ ] Edge cases tested: abbreviations, Singlish, typos, incomplete info
- [ ] Multi-shift job parsing correct
- [ ] Recurring job natural language parsing correct
- [ ] Fallback behaviour when parsing fails (admin re-prompt)
- [ ] Admin confirmation step prevents bad data from persisting
- [ ] Gemini and OpenAI failover tested
- [ ] LLM response latency acceptable (< 5s p95)

### 4. GPS Validation Testing

- [ ] Check-in within radius (100m default) — accepted
- [ ] Check-in outside radius — rejected with clear message
- [ ] Custom radius per site — configurable and enforced
- [ ] Low GPS accuracy (> 100m uncertainty) — handled gracefully
- [ ] Indoor/basement scenarios — degraded accuracy handled
- [ ] No GPS available — fallback/manual override path works
- [ ] GPS spoofing basic deterrence in place
- [ ] Location data stored with accuracy metadata

### 5. Photo Upload Reliability

- [ ] Photo upload via WhatsApp — received and stored
- [ ] Large photos (> 5MB) handled (compression or rejection)
- [ ] Slow network upload — timeout and retry messaging
- [ ] Multiple photos per check-in handled
- [ ] Photo storage on DigitalOcean Spaces (or equivalent) verified
- [ ] Photo retrieval for DO report generation confirmed
- [ ] Periodic photo reminders sent on schedule
- [ ] Missed photo alert triggers to admin

### 6. PDF Generation Quality

- [ ] DO report PDF includes: job details, timestamps, GPS, photos, remarks
- [ ] PDF layout renders correctly with varying data (1 officer vs 10)
- [ ] Photos embedded at acceptable quality/resolution
- [ ] GPS coordinates and map/address shown
- [ ] Signature image embedded after signing
- [ ] Incident notes and special remarks included
- [ ] PDF file size reasonable (< 10MB per report)
- [ ] PDF generation completes within 30s for complex reports

### 7. Digital Signature Flow

- [ ] Signature link delivered via WhatsApp to site manager
- [ ] Mobile number verification step works
- [ ] IC last 4 digits verification step works
- [ ] Signature capture on mobile browser (touch/draw) functional
- [ ] 1-hour timeout enforced — link expires correctly
- [ ] Timeout escalation to admin works
- [ ] Re-send signature link flow works
- [ ] Signed PDF locked / tamper-evident
- [ ] Signature page loads on: iOS Safari, Android Chrome, Samsung Internet

### 8. Email Delivery

- [ ] DO report PDF attached and delivered to finance email
- [ ] Email recipient configurable per job / per client
- [ ] Email delivery confirmed (SPF/DKIM/DMARC properly configured)
- [ ] Failed email delivery — retry and admin alert
- [ ] Email content includes job summary and report identifier
- [ ] No emails land in spam (tested with Gmail, Outlook)

### 9. Quality Assurance

- [ ] All test scenarios executed
- [ ] Regression testing passed
- [ ] End-to-end flow: job creation → assignment → check-in → photo → DO → signature → email
- [ ] Mobile WhatsApp testing: iOS + Android
- [ ] Signature page testing: iOS Safari, Android Chrome
- [ ] No P1/P2 bugs open
- [ ] Bug count: [X total, Y fixed, Z deferred (P3/P4 only)]

**QA Sign-off:**
| Name | Date | Status |
|------|------|--------|
| [QA Lead] | [YYYY-MM-DD] | ⬜ Pending |

### 10. User Acceptance Testing

- [ ] UAT environment deployed with production-like GreenAPI config
- [ ] UAT test cases executed by Ken / client representative
- [ ] Real WhatsApp messages sent and received during UAT
- [ ] Full job lifecycle tested with real devices
- [ ] All UAT feedback addressed or documented for next release
- [ ] Client sign-off received

**UAT Sign-off:**
| Name | Date | Status |
|------|------|--------|
| Ken | [YYYY-MM-DD] | ⬜ Pending |
| [Client Rep] | [YYYY-MM-DD] | ⬜ Pending |

### 11. Performance & Load Testing

- [ ] Load test: 1,000 concurrent officers simulated
- [ ] Load test: 1,000 jobs created in a single day
- [ ] WhatsApp message throughput: [target msgs/min] — actual: [measured]
- [ ] API response time (p95): < 500ms — actual: [measured]
- [ ] LLM parsing under load: no degradation
- [ ] GPS check-in under load: no dropped validations
- [ ] PDF generation queue handles peak load (end-of-shift burst)
- [ ] Database query performance acceptable under load
- [ ] No memory leaks after 24h soak test
- [ ] GreenAPI rate limits not breached under normal load

### 12. Security Review

- [ ] OWASP Top 10 reviewed
- [ ] WhatsApp webhook endpoint authenticated
- [ ] Signature page: verification prevents unauthorized access
- [ ] Signature link tokens are single-use and time-bound
- [ ] Input validation on all LLM-parsed data
- [ ] SQL injection / XSS prevention verified
- [ ] Officer location data access restricted to authorized admins
- [ ] Photo storage: private access only (no public URLs)
- [ ] Sensitive data encrypted at rest + in transit (TLS)
- [ ] Dependency vulnerability scan: 0 critical, 0 high

**Security Sign-off:**
| Name | Date | Status |
|------|------|--------|
| [Security Lead] | [YYYY-MM-DD] | ⬜ Pending |

### 13. Documentation

- [ ] API documentation (internal endpoints)
- [ ] GreenAPI webhook integration guide
- [ ] Admin user guide (WhatsApp commands and flows)
- [ ] Officer onboarding guide (check-in steps)
- [ ] Site manager guide (how to sign DO report)
- [ ] Release notes drafted
- [ ] Environment setup / README current

### 14. DigitalOcean Deployment

- [ ] Production Droplet / App Platform provisioned and sized
- [ ] PostgreSQL database provisioned (managed or self-hosted)
- [ ] Database migrations reviewed and tested
- [ ] Environment variables configured (GreenAPI keys, LLM keys, SMTP, etc.)
- [ ] DigitalOcean Spaces configured for photo/PDF storage
- [ ] SSL/TLS certificates configured
- [ ] Domain / DNS configured for signature page
- [ ] GreenAPI webhook URL pointed to production endpoint
- [ ] Deployment runbook documented
- [ ] Rollback plan documented and tested
- [ ] Monitoring & alerts configured (uptime, error rates, queue depth)
- [ ] Log aggregation configured
- [ ] Backup strategy for database and file storage confirmed
- [ ] Deployment window confirmed: [date, time, duration]

**DevOps Sign-off:**
| Name | Date | Status |
|------|------|--------|
| [DevOps Lead] | [YYYY-MM-DD] | ⬜ Pending |

---

## Go / No-Go Decision

| Approver | Role | Decision | Date |
|----------|------|----------|------|
| Ken | Product Owner | ⬜ | |

**Decision:** [🟢 GO / 🔴 NO-GO]
**Notes:** [Any conditions, known issues accepted, or follow-up items]

---

## Post-Release

- [ ] Production smoke test: send a WhatsApp message, create a job, full cycle
- [ ] GreenAPI webhook health confirmed in production
- [ ] Monitoring dashboards reviewed (no anomalies for 2h)
- [ ] First real job created and completed successfully
- [ ] Client notified of release
- [ ] Release notes published
- [ ] Retrospective scheduled: [YYYY-MM-DD]
