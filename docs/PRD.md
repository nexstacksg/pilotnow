# PilotNow – Product Requirements Document

**Smart Workforce Management via WhatsApp**

Prepared By: NexStack Pte Ltd
Version: MVP – Admin & Security Officer Only

---

## 1. Background & Problem Statement

Security manpower companies rely heavily on WhatsApp, phone calls, and paper-based processes to manage jobs, officers, attendance proof, and billing. These workflows are manual, time-consuming, error-prone, and difficult to scale.

Current problems include:

- Manual job posting that takes 10–15 minutes per job
- Difficulty tracking job acceptance in busy WhatsApp chats
- Frequent phone calls to chase officers for check-ins and photos
- Missing or unreliable attendance proof (no GPS, timestamps)
- Paper-based signatures that are delayed or lost
- Slow DO report preparation leading to delayed billing and cash-flow gaps

## 2. Product Vision & Objectives

### Vision

Enable security companies to manage their workforce end-to-end using WhatsApp as the primary interface, powered by automation and AI.

### Objectives (MVP)

- Reduce administrative effort for job management
- Ensure 100% verifiable attendance proof
- Improve officer experience with clear, simple workflows
- Generate DO reports automatically for faster billing

### Success Metrics (KPIs)

| Metric | Target |
|---|---|
| Admin time reduction per job | ≥80% |
| GPS + timestamp + photo coverage | 100% |
| DO report generation | Immediately after job completion |
| Billing initiation | Within 24 hours |

## 3. User Roles (MVP Scope)

### 3.1 Primary System Users

**Admin / Operations Manager**

Admin is the only control role in the system.

Responsibilities:
- Receive job requests from customers (via WhatsApp or email)
- Create and manage jobs via WhatsApp
- Assign security officers to jobs
- Monitor attendance, GPS check-ins, and photo proof
- Generate and send DO reports to finance

**Security Officer**

Security Officers are primary field users.

Responsibilities:
- Receive job assignment notifications via WhatsApp
- Acknowledge assignments
- Perform GPS + photo check-ins
- Submit periodic site photos (frequency per job type)
- Complete assigned duties

### 3.2 External Actors (No User Accounts)

These stakeholders are not system users in the MVP and do not have logins or dashboards.

- **Customer:** Sends job requests to PilotNow company (via WhatsApp or email)
- **Site Manager:** Signs DO report via one-time digital link (verified by mobile + IC last 4 digits)
- **Finance Team:** Receives DO report PDF via email for billing

## 4. In-Scope Features (MVP)

### Job Management
- Natural language job creation via WhatsApp (admin)
- LLM-powered job detail parsing (free-form text → structured data)
- Job edits and cancellation
- Recurring job support (same site, same time, weekly)

### Assignment Management
- Admin-driven officer assignment (not self-selection)
- Multi-officer assignment per job
- Single-job constraint per officer (no concurrent jobs)
- Assignment notifications to officers

### Attendance & Proof
- GPS-verified photo check-in (default 100m radius, configurable per site)
- Automatic timestamping
- Periodic photo reminders (frequency defined per job type)
- Missing or late proof detection → immediate admin alert
- No-show detection → admin alert after 10 minutes
- Automated escalation for no-shows

### Reporting
- Automatic DO report generation (PDF)
- Report contents: job details, timestamps, GPS data, photos, officer remarks, incident notes
- Digital signature capture via link (verified by mobile number + IC last 4 digits)
- Signature timeout: 1 hour → escalation
- Email delivery of DO report (configurable recipient per job/client)

## 5. Out of Scope (MVP)

- Web admin dashboard
- Native mobile applications
- Payroll and salary automation
- Advanced analytics and reporting
- Multi-language support
- Finance acknowledgement tracking

## 6. Key User Flows

### 6.1 Job Creation Flow

```
Customer sends job request via WhatsApp/email to PilotNow
  → Admin receives and reviews request
  → Admin sends job details via WhatsApp (natural language)
  → LLM parses message into structured job data
  → Admin confirms parsed job details
  → Job is created in system
```

### 6.2 Officer Assignment Flow

```
Admin selects officers for the job
  → System sends assignment notification to officers via WhatsApp
  → Officers acknowledge assignment
  → Job status updated
```

### 6.3 Attendance & Proof Flow (Officer)

```
Officer arrives at site
  → Officer submits GPS + photo check-in
  → System validates GPS (within configured radius)
  → Proof stored with timestamp
  → Periodic photo reminders sent (per job type frequency)
  → If missed: admin alerted immediately
  → If no check-in within 10 min: automated escalation
```

### 6.4 Job Completion & DO Report Flow

```
Shift ends → System generates DO report (PDF)
  → Digital signature link sent to Site Manager
  → Site Manager verifies via mobile + IC last 4 digits
  → Site Manager signs
  → If not signed within 1 hour: escalation
  → Signed DO report emailed to finance (PDF)
```

## 7. Functional Requirements

### Admin
- Create, edit, cancel jobs (natural language via WhatsApp)
- Assign/reassign officers to jobs
- View job status and assigned officers
- Monitor attendance and proof in real-time
- Receive alerts for missed check-ins and no-shows
- Generate and send DO reports

### Security Officer
- Receive job assignment notifications
- Acknowledge assignments
- Submit GPS + photo check-ins
- Submit periodic site photos
- Receive reminders and confirmations

## 8. Non-Functional Requirements

### Performance
- Job broadcast within 5 seconds
- Photo upload confirmation within 3 seconds

### Security
- GreenAPI WhatsApp integration
- Encrypted media storage
- Access control by role
- Site manager verification (mobile + IC last 4 digits)

### Reliability
- Retry logic for failed uploads
- Graceful handling of network interruptions
- Automated escalation for no-shows and missed proofs

## 9. Assumptions & Constraints

### Assumptions
- All officers use WhatsApp
- GPS permissions are enabled on officer devices
- WhatsApp Business API already approved (GreenAPI)

### Constraints
- WhatsApp API rate limits
- GPS accuracy depends on device and environment
- One officer cannot work multiple concurrent jobs
- 3 shift maximum per job

## 10. MVP Delivery Timeline

**Total: 8 weeks**

| Week | Deliverable |
|---|---|
| Week 1–2 | Infrastructure, GreenAPI WhatsApp setup, LLM integration |
| Week 3–4 | Job creation, assignment, and notification flows |
| Week 5–6 | Attendance, GPS check-in, photo proof, escalation |
| Week 7 | DO reporting, digital signature, email delivery |
| Week 8 | End-to-end testing & pilot launch |

## 11. Future Enhancements (Post-MVP)

- Web admin dashboard
- Officer performance analytics
- Payroll integration
- Multi-company support
- AI-based attendance anomaly detection
- Configurable photo reminder frequency per job
