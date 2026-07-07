# Product Requirement Document (PRD)

| Field | Value |
|-------|-------|
| **Project** | PilotNow |
| **Client** | NexStack Pte Ltd |
| **Version** | 2.0 |
| **Status** | Draft |
| **Author** | Aira Ling |
| **Reviewers** | Ken Ling |
| **Created** | 2026-02-23 |
| **Last Updated** | 2026-05-12 |

### Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-23 | Aira Ling | Initial PRD |
| 2.0 | 2026-05-12 | Aira Ling | Rewritten as full baseline product requirement and end-to-end operational flow |

---

## 1. Executive Summary

PilotNow is a workforce operations platform for security manpower companies in Singapore. It is a **web application** with WhatsApp-integrated field execution, supported by structured admin operations, reporting, compliance, and finance handoff workflows.

This PRD now describes the **full baseline requirement set** for the business: from client and site setup, to job intake, scheduling, assignment, attendance proof, escalations, DO reporting, digital sign-off, client visibility, finance delivery, and audit visibility.

PilotNow must help operations teams reduce manual coordination, improve staffing reliability, create verifiable proof-of-service, accelerate billing readiness, and maintain a defensible audit trail for service delivery disputes.

## 2. Product Vision

### Vision

Build the operating system for security manpower operations: one platform that manages daily jobs, officers, evidence, exceptions, client sign-off, and finance-ready closure.

### Product Positioning

PilotNow is not just a chat bot. It is a **web application for operations management** with:
- WhatsApp as the primary execution interface for field staff
- a web application as the primary management interface for admins and operations teams
- strong auditability for client, finance, and compliance use cases

### Core Value Promise

If PilotNow becomes the single system for workforce job execution, then security manpower companies can:
- create and manage jobs faster
- reduce no-show and missed-proof risk
- improve service accountability
- shorten time from completed shift to invoice-ready documentation
- reduce dependence on manual chats, phone calls, and paper trails

## 3. Business Problem

Security manpower operations are typically fragmented across:
- WhatsApp chats
- phone calls
- spreadsheets
- paper DO forms
- manually prepared PDF reports

This creates several problems:
1. **Job intake is inconsistent** — details arrive in different formats and are easy to miss
2. **Scheduling is manual** — assignment conflicts and under-coverage are common
3. **Field visibility is weak** — officers must be chased for acknowledgement, check-in, proof, and checkout
4. **Evidence is incomplete** — GPS, timestamps, photos, and remarks are not reliably centralized
5. **Exceptions are reactive** — no-shows, missed proofs, and signature delays are handled too late
6. **Billing is delayed** — DO reports and sign-off are slow, incomplete, or untraceable
7. **Auditability is poor** — disputes are hard to resolve without a trusted evidence chain

## 4. Goals and Success Metrics

| Goal | Metric | Target Direction |
|------|--------|------------------|
| Reduce admin effort | Time from request intake to staffed job | Major reduction vs current manual process |
| Improve staffing reliability | Jobs fully staffed and acknowledged before start | High pre-shift coverage confidence |
| Improve attendance proof | Shifts with GPS + timestamp + photo evidence | Full coverage for attended shifts |
| Improve exception handling | Time to detect and react to no-show / missed proof | Near real-time |
| Accelerate billing readiness | Time from shift completion to finance-ready report | Same-day where operationally possible |
| Improve auditability | Availability of searchable operational evidence | Full job-level traceability |

## 5. Users and Personas

### 5.1 Admin / Ops Manager
Owns daily operations, creates jobs, oversees staffing, tracks attendance, handles escalations, and ensures reports are closed properly.

**Needs:** speed, control, exception visibility, accurate reporting.

### 5.2 Dispatcher / Scheduler
Focuses on manpower planning, assignments, shift coverage, replacements, standby resources, and conflict resolution.

**Needs:** officer availability visibility, assignment conflict detection, fast reassignment tools.

### 5.3 Security Officer
Receives assignments, acknowledges jobs, checks in/out, responds to proof requests, and submits remarks or incidents.

**Needs:** simple instructions, low-friction workflows, minimal typing, reliable reminders.

### 5.4 Site Manager
Client-side approver who verifies service delivery and signs off the DO report.

**Needs:** trustworthy, simple, mobile-friendly sign-off experience.

### 5.5 Client Operations Contact
Client-side stakeholder who may need visibility into active jobs, report status, service exceptions, and completed reports without full internal admin access.

**Needs:** limited but reliable visibility into service delivery and report outcomes.

### 5.6 Finance Team
Receives completed reports to support invoice preparation and client billing.

**Needs:** timely, complete, traceable report delivery.

### 5.7 Management / Operations Lead
Needs visibility across jobs, exceptions, incident trends, response times, staffing performance, and service quality.

**Needs:** dashboards, search, audit views, exports.

## 6. Product Principles

1. **Field execution must stay simple** — officers should operate mostly through WhatsApp.
2. **Admin control must be structured** — chat alone is not enough for operational management.
3. **Exceptions matter as much as happy paths** — no-show and evidence gaps are core product concerns.
4. **Every important event should be traceable** — assignment, attendance, incident, signature, delivery.
5. **Reports must be finance-ready** — not just operationally informative.
6. **Compliance cannot be an afterthought** — personal data, GPS, photos, and signatures must be handled responsibly.

## 7. End-to-End Operational Flow

### 7.1 Master Data Setup
Admin configures:
- clients
- sites
- site managers
- officers
- job types
- finance recipients
- attendance radius rules
- escalation settings
- report and delivery defaults

### 7.2 Job Intake
Jobs can originate from:
- free-form WhatsApp job requests
- customer-facing WhatsApp order messages handled directly by the AI
- structured admin entry
- recurring templates / schedules
- amendments to existing jobs

System responsibilities:
- parse job details
- validate required fields
- detect duplicates
- link or create site/client data
- flag ambiguities before job creation

For customer-facing WhatsApp intake, the system must also:
- acknowledge receipt immediately
- create a draft structured job from the pasted order
- identify missing or low-confidence fields
- optionally confirm extracted details with the customer before fulfilment starts

### 7.3 Planning and Scheduling
Admin or dispatcher:
- reviews open jobs
- checks staffing requirements
- assigns officers
- resolves conflicts
- manages recurring schedules
- handles understaffed or standby scenarios

Where configured, the AI may also perform an autonomous fulfilment flow by:
- searching the officer pool for suitable candidates based on availability, proximity, required credentials, and reliability
- contacting officers one-by-one or in controlled sequence through WhatsApp
- negotiating within pre-configured commercial boundaries
- escalating to a human dispatcher when limits, ambiguity, or risk thresholds are hit
- assigning the agreed officer immediately once acceptance is secured

### 7.4 Pre-Shift Readiness
System and admin ensure:
- officers received assignment
- officers acknowledged
- reminders are sent before shift start
- at-risk jobs are visible before service failure occurs

### 7.5 Live Field Execution
Officer flow:
- receives assignment
- acknowledges
- checks in with photo + location
- responds to periodic proof requests
- submits remarks or incidents
- checks out at shift end

### 7.6 Exception Handling
System detects and escalates:
- no-show
- missed acknowledgement
- missed periodic proof
- GPS anomalies
- early checkout
- failed outbound delivery
- unsigned report after timeout

Admin can:
- reassign
- override
- resend
- mark exceptions
- close jobs with manual notes

### 7.7 Report Closure
Once job execution completes:
- system assembles DO report
- report includes full evidence trail
- site manager receives signature request
- signed or unsigned status is recorded

### 7.8 Client, Finance, and Audit Follow-Through
System then:
- exposes appropriate report and status visibility to site manager and client-side users
- sends report to finance recipients
- logs delivery outcome
- preserves all evidence, messages, timestamps, and status history for later review

### 7.9 AI-Driven Customer Order to Fulfilment Flow
PilotNow shall support a conversation-driven operating mode where the customer can paste a manpower request into WhatsApp and the system drives the fulfilment process end to end.

Required flow:
1. customer sends order in WhatsApp
2. AI acknowledges receipt immediately
3. AI parses order into a draft job record
4. system validates fields and confidence
5. AI searches best-fit officers based on configurable rules
6. AI opens officer conversation with proposed shift and starting rate
7. AI negotiates only within approved rate boundaries for that client, shift type, or officer type
8. if agreement is reached, system assigns officer and updates job status to Assigned
9. AI updates the customer thread that the order is fulfilled
10. pre-shift reminders and acknowledgement logic continue automatically

Human escalation must be triggered when:
- required job details are still ambiguous
- no suitable officer is found
- negotiation exceeds allowed commercial limits
- multiple officers decline and service risk rises
- the AI detects an exception requiring business judgement

## 8. Functional Requirement Modules

## 8.1 Master Data Management

### FR-001 Client Management
System shall allow admins to create, update, activate, deactivate, and search client records.

**Minimum fields:** company name, billing name, operations contact, finance email(s), service notes, status.

### FR-002 Site Management
System shall allow admins to create and maintain site records.

**Minimum fields:** site name, address, GPS coordinates, attendance radius, linked client, site manager, special instructions, status.

### FR-003 Site Manager Management
System shall store one or more site manager contacts per site, including signing permissions and priority order.

### FR-004 Officer Management
System shall support officer onboarding, editing, activation/deactivation, and search.

**Minimum fields:** name, phone, IC last 4, status, notes, preferred assignments, emergency tags.

### FR-005 Job Type / Operating Rule Management
System shall allow admins to define job types with defaults such as reminder frequency, standard instructions, staffing assumptions, and escalation policies.

## 8.2 Job Intake and Creation

### FR-006 Natural Language Job Intake
Admins shall be able to submit free-form job requests via WhatsApp. The system shall parse site, date, time, manpower count, job type, and notes into structured data for confirmation.

The same parsing capability shall support **customer-facing WhatsApp intake** where an external customer sends a manpower request directly to the AI-managed chat or group.

### FR-007 Structured Job Entry and Editing
Admins shall also be able to create or edit jobs through structured operational input, not only conversational input.

### FR-008 Job Confirmation Workflow
No parsed job shall be committed without explicit confirmation or validated structured submission.

For customer-facing AI intake, the system shall support configurable confirmation modes:
- always confirm with customer before job creation
- auto-create draft job when confidence is high
- auto-create draft and only ask clarifying questions for missing fields

### FR-009 Duplicate / Conflict Detection
The system shall warn admins of likely duplicates or overlapping jobs at the same site/date/time before final creation.

### FR-010 Recurring Jobs
System shall support recurring schedules with series management, instance-level edits, skips, cancellations, and forward generation rules.

### FR-011 Job Amendments and Cancellation
Admins shall be able to amend start/end time, officer count, notes, site, and staffing requirements, or cancel jobs with notification and audit logging.

## 8.3 Scheduling and Assignment

### FR-012 Officer Assignment
Admins shall be able to assign one or more officers to a job, with validation against assignment conflicts, inactive status, and missing data.

The system shall also support **AI-driven officer assignment orchestration** where the AI proposes or completes assignment based on configured rules and officer acceptance.

### FR-013 Officer Acknowledgement
Officers shall be required to acknowledge assignments. Acknowledgement status shall be visible to admins.

### FR-014 Reassignment and Replacement
Admins shall be able to replace an assigned officer with another officer before or during the job, while retaining a full audit trail.

### FR-015 Coverage and Staffing Visibility
System shall surface understaffed jobs, unacknowledged jobs, and assignment risks before shift start.

### FR-016 Standby / Backup Handling
System should support tagging replacement candidates or standby officers for at-risk jobs.

### FR-017 Officer Availability and Off-Day Management
System should support lightweight officer availability management, including off-day flags, unavailable periods, and assignment warnings. Recommendation: include this in baseline scope as a lightweight operational control, not a full rostering/payroll module.

### FR-018 AI Candidate Matching
System shall support AI-assisted search and ranking of candidate officers for a job using configurable factors including:
- availability / conflict-free status
- distance or travel suitability to site
- required certifications, rank, or eligibility
- reliability or attendance performance indicators
- client or site-specific officer preferences or exclusions

The ranking output shall be visible to admins when required.

### FR-019 Bounded Rate Negotiation
System shall support AI-led WhatsApp negotiation with officers using pre-configured commercial rules.

Minimum capabilities:
- default offered rate by client, site, job type, shift type, or officer type
- minimum and maximum negotiable rate boundaries
- step-up or fallback negotiation rules
- escalation to human dispatcher when requested rate exceeds limits or confidence is low
- complete logging of offer, counter-offer, accepted rate, escalation, and final outcome

The AI shall never confirm a rate above the allowed boundary without human approval.

### FR-020 Fulfilment Status Updates to Customer
When a customer-originated order is being processed, the system shall update the customer conversation with meaningful fulfilment states such as:
- request received
- clarification needed
- sourcing in progress
- officer assigned / order fulfilled
- fulfilment risk / escalated to operations

Customer-facing updates must be configurable to avoid exposing sensitive internal details beyond approved fields.

## 8.4 Field Execution and Attendance Proof

### FR-021 Check-In
Officers shall check in using photo + location. The system shall validate GPS against site radius and record timestamp, coordinates, accuracy, and media.

### FR-022 Configurable Periodic Proof of Presence and Status Updates
System shall send configurable reminder-based proof requests during active shifts according to client, site, job type, shift type, officer type, or assignment rule, and store returned evidence with timestamps.

Each proof request may require one or more of the following based on configuration:
- live photo
- location / GPS
- current job status
- remarks

The system shall support configurable proof intervals such as every 30 minutes, every 1 hour, or every 2 hours, plus response grace periods, end-of-shift suppression rules, and escalation rules for missed responses.

### FR-023 Check-Out
Officers shall check out using photo + location. Final checkout status shall contribute to report closure.

### FR-024 Remarks and Incident Logging
Officers shall be able to submit remarks and incident reports during active jobs. Incidents shall be flagged and optionally alerted immediately.

### FR-025 Pre-Shift Reminder and Readiness Tracking
System shall support configurable pre-shift reminders to assigned officers, including multiple reminder points such as 2 hours before shift and 30 minutes before shift.

The system shall:
- record whether the officer acknowledged readiness
- identify non-responsive officers before shift start
- generate soft escalation or dispatcher alerts when readiness confirmation is missing

### FR-026 Evidence Quality and Exception Flagging
System shall flag low-confidence evidence scenarios such as missing location, weak GPS accuracy, unusual distance, early checkout, or suspicious proof patterns for admin review.

## 8.5 Escalation and Exception Management

### FR-027 No-Show Detection
If an officer does not check in within the configured threshold after shift start, the system shall alert admins and present reassignment options.

### FR-028 Missed Acknowledgement Alerting
If an officer does not acknowledge in time, the system shall remind and escalate to admin.

### FR-029 Missed Proof Escalation
If periodic proof or status response is missed, the system shall notify admins immediately or in batched alert mode based on configuration.

### FR-030 AI Negotiation and Fulfilment Escalation
System shall escalate to admin or dispatcher when autonomous fulfilment cannot complete within configured business rules, including:
- no suitable officer found
- repeated officer decline
- commercial limit exceeded
- customer clarification unresolved
- fulfilment deadline at risk

Escalation state shall be visible in admin monitoring views.

### FR-031 Delivery Failure Handling
System shall detect failed WhatsApp or email deliveries, retry where appropriate, and expose failure states to admins.

### FR-032 Manual Override and Resolution
Admins shall be able to mark exceptions as reviewed, overridden, resolved, or accepted with reason notes.

## 8.6 DO Reporting and Sign-Off

### FR-028 DO Report Generation
System shall generate a DO report automatically when job execution reaches closure criteria.

**Report contents include:**
- client and site details
- officer assignments
- acknowledgement status
- check-in/out evidence
- periodic proof
- remarks and incidents
- timestamps
- GPS coordinates
- signature status
- job outcome notes

### FR-029 Partial / Cancelled / Exception Reports
System shall support partial reports for cancelled, early-terminated, or exception-heavy jobs.

### FR-030 Digital Signature Workflow
System shall send a secure signature request to the designated site manager and capture signed approval through a mobile-friendly web page.

### FR-031 Signature Verification and Timeout
System shall verify signer identity using configured rules and escalate unsigned reports after timeout.

### FR-032 Unsigned Closure Path
Admins shall be able to mark a report unsigned with reason, preserving billing and audit workflows where business rules allow.

## 8.7 Client Visibility and Finance Handoff

### FR-033 Client Report Visibility
System shall provide site manager and authorized client users with appropriate visibility into report status, signed/unsigned state, and completed report access based on permission scope.

### FR-034 Finance Delivery Rules
System shall support default and client-specific finance recipients for report delivery.

### FR-035 Finance Email Delivery
System shall email signed or unsigned reports with clear delivery state and retry handling.

### FR-036 Delivery Traceability
Admins shall be able to see whether a report was sent, delivered, failed, retried, or resent.

## 8.8 Admin Operations Console

### FR-037 Job Monitoring View
System shall provide a structured view of live, upcoming, completed, cancelled, and exception-state jobs.

### FR-038 Search and Filter
Admins shall be able to search and filter by client, site, officer, job ID, date, status, exception type, and report status.

### FR-039 Evidence and History Review
Admins shall be able to inspect job timelines, messages, attendance events, photos, remarks, incidents, signatures, and delivery logs.

### FR-040 Action Shortcuts
Admins shall be able to trigger supported actions such as resend, reassign, override, cancel, mark unsigned, and resend finance delivery.

## 8.9 Reporting, Audit, and Compliance

### FR-041 Operational Reporting
System shall provide operational reporting such as job volume, fill rate, no-show rate, proof misses, and signature turnaround.

### FR-042 Audit Trail
Every significant operational event shall be logged with actor, timestamp, context, and previous/new state.

### FR-043 Data Retention and Access Control
System shall enforce retention rules, secure access, and role-appropriate visibility for personal data, GPS data, photos, and signatures.

### FR-044 Export and Dispute Support
System shall support export or retrieval of relevant evidence and job history for dispute resolution or audit requests.

## 9. Detailed Flow Expectations

### 9.1 Job Intake Flow
1. Admin submits job request
2. System parses or structures input
3. Missing or ambiguous fields are surfaced
4. Admin confirms or edits
5. Job is created and linked to master data
6. Duplicate/conflict warnings are shown if relevant

### 9.2 Assignment Flow
1. Admin selects job
2. Admin assigns officer(s)
3. System validates conflicts and status
4. Officer receives assignment
5. Officer acknowledges or declines
6. Admin sees acknowledgement status and follows up if needed

### 9.3 Check-In Flow
1. System sends reminder before start
2. Officer submits photo + location
3. System validates radius and evidence quality
4. Successful check-in updates job and assignment state
5. Failed or missing proof creates actionable prompts and risk flags

### 9.4 Live Shift Monitoring Flow
1. System schedules configurable periodic proof events
2. Officer submits required photo, location, status, and optional remarks, or misses the request
3. Exceptions are escalated to admin based on configured grace period and escalation rule
4. Incidents, remarks, and proof history are captured into the job timeline

### 9.5 Closure and Reporting Flow
1. Officer checks out
2. Final state is verified
3. DO report is generated
4. Signature request is sent
5. Signed or unsigned outcome is recorded
6. Finance delivery is triggered
7. Audit trail remains searchable

## 10. Non-Functional Requirements

### Performance
- WhatsApp response latency should feel near real-time for standard interactions
- LLM parsing should complete within operationally acceptable chat latency
- Report generation should complete fast enough for same-day closure workflows
- Live job monitoring views should remain responsive under daily operational load

### Reliability
- Message retries and queueing are required
- Failures must be visible, not silent
- Evidence should not be lost if external integrations are temporarily unavailable

### Security
- HTTPS for all web surfaces
- secure tokenized signature links
- encrypted storage and transport where applicable
- controlled access to officer/client evidence

### Compliance
- PDPA-aware handling of GPS, photos, phone numbers, and signatures
- configurable retention policies
- audit visibility for sensitive data access and key actions

### Scalability
- initial operational baseline: 1,000 jobs/officers per day
- architecture should support higher scale without major workflow redesign

## 11. Integrations

| Integration | Purpose |
|-------------|---------|
| GreenAPI | WhatsApp messaging and inbound/outbound events |
| Gemini / OpenAI | Parsing and intent support |
| Maps / Geocoding | Address normalization and GPS validation |
| Email provider | Finance delivery and notifications |
| File storage | Photos, signatures, PDFs |
| Monitoring / alerting | Operational reliability and exception awareness |

## 12. Risks

| Risk | Impact | Mitigation Direction |
|------|--------|----------------------|
| Messaging provider instability | High | queueing, retry, visibility, fallback procedures |
| GPS inaccuracy | Medium | configurable radius, accuracy capture, override workflow |
| Parsing ambiguity | Medium | confirmation flow, structured correction path |
| Human non-response | High | reminders, escalations, manual override paths |
| Weak audit trace | High | event logging, searchable history, evidence retention |
| Compliance gaps | High | retention, access control, sensitive-data handling |

## 13. Release / Delivery Note

This PRD defines the **full product requirement baseline**. Delivery can still be phased, but phasing decisions must be made explicitly after the full requirement is agreed.

Earlier MVP commercial references have been removed from product framing and do not define the requirement boundary.

## 14. Product Decisions Confirmed

1. **Primary product form:** PilotNow is a **web application**.
2. **Field execution channel:** WhatsApp remains the primary field execution channel for officers.
3. **Admin operations model:** Admin and operations management should be handled primarily through the web application.
4. **Officer availability recommendation:** Include **lightweight officer availability / off-day management** in baseline scope for assignment quality, but do not expand into full rostering or payroll.
5. **Client-side visibility:** Support both **site manager** and **client-side users** with appropriate report/status visibility.
6. **Report requirement:** Report generation is mandatory baseline behaviour and must support signed, unsigned, partial, and exception scenarios.
7. **Finance workflow:** Report generation and delivery traceability are required; finance acknowledgement can remain optional unless business workflow later requires explicit confirmation.

## 15. Baseline Requirement Checklist

### Product Model
- [x] Product is defined as a web application
- [x] WhatsApp remains primary for field execution
- [x] Admin operations run primarily via web

### Core Operations
- [x] Client management included
- [x] Site management included
- [x] Site manager management included
- [x] Officer management included
- [x] Job type / operating rules included
- [x] Natural-language job intake included
- [x] Structured job entry included
- [x] Recurring jobs included
- [x] Assignment and reassignment included
- [x] Lightweight officer availability / off-day handling included

### Field Execution
- [x] Check-in included
- [x] Periodic proof included
- [x] Check-out included
- [x] Remarks and incident logging included
- [x] Evidence quality flagging included

### Exception Handling
- [x] No-show escalation included
- [x] Missed acknowledgement escalation included
- [x] Missed proof escalation included
- [x] Delivery failure handling included
- [x] Manual override workflow included

### Reporting and Closure
- [x] DO report generation included
- [x] Partial / cancelled / exception reports included
- [x] Digital signature included
- [x] Unsigned closure path included
- [x] Site manager visibility included
- [x] Client visibility included
- [x] Finance delivery included
- [x] Delivery traceability included

### Admin and Governance
- [x] Admin monitoring view included
- [x] Search and filter included
- [x] Evidence/history review included
- [x] Action shortcuts included
- [x] Operational reporting included
- [x] Audit trail included
- [x] Data retention and access control included
- [x] Export / dispute support included

## 16. Definition of Done for Requirement Sign-Off

This PRD is ready for sign-off when:
- full end-to-end business flow is accepted
- baseline modules are accepted
- exception handling paths are accepted
- admin visibility expectations are accepted
- compliance and audit expectations are accepted
- phased delivery, if any, is treated as execution planning rather than requirement reduction

---

## Appendix

- [Discovery Brief](01-discovery-brief.md)
- [Scope](02-scope-v01.md)
- [Release Checklist](07-release-checklist.md)
- Tech direction: Hono.js, PostgreSQL, DigitalOcean, GreenAPI, Gemini, OpenAI
