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
- Create and manage jobs via WhatsApp
- Broadcast jobs to security officers
- Monitor job acceptance and assignments
- Track attendance, GPS check-ins, and photo proof
- Generate and send DO reports to finance

**Security Officer**

Security Officers are primary field users.

Responsibilities:
- Receive job notifications via WhatsApp
- Accept or pass job requests
- Perform GPS + photo check-ins
- Submit hourly site photos
- Complete assigned duties

### 3.2 External Actors (No User Accounts)

These stakeholders are not system users in the MVP and do not have logins or dashboards.

- **Site Manager:** Signs DO report via one-time digital link
- **Finance Team:** Receives DO report via email for billing

## 4. In-Scope Features (MVP)

### Job Management
- Natural language job creation via WhatsApp
- AI-powered job detail parsing
- Job broadcast to eligible officers
- Job edits and cancellation

### Assignment Management
- One-tap job acceptance (Request / Pass)
- Auto-assignment based on response order
- Assignment quota enforcement

### Attendance & Proof
- GPS-verified photo check-in
- Automatic timestamping
- Hourly photo reminders
- Missing or late proof detection

### Reporting
- Automatic DO report generation
- Digital signature capture via link
- Email delivery of DO report

## 5. Out of Scope (MVP)

- Web admin dashboard
- Native mobile applications
- Payroll and salary automation
- Advanced analytics and reporting
- Multi-language support

## 6. Key User Flows

### 6.1 Job Creation Flow (Admin)

```
Admin sends natural language job request via WhatsApp
  → System parses message into structured job data
  → Admin confirms job details
  → Job is broadcast to officers
```

### 6.2 Job Acceptance Flow (Officer)

```
Officer receives job card in WhatsApp
  → Officer taps Request or Pass
  → System auto-assigns based on availability
  → Confirmation sent to officer
```

### 6.3 Attendance & Proof Flow (Officer)

```
Officer receives check-in reminder
  → Officer submits GPS + photo
  → System validates and stores proof
  → Hourly reminders continue until shift ends
```

### 6.4 Job Completion Flow

```
System sends digital signature link
  → Site Manager signs via browser
  → DO report auto-generated
  → Report emailed to finance
```

## 7. Functional Requirements

### Admin
- Create, edit, cancel jobs
- View job status and assigned officers
- Monitor attendance and proof
- Generate and send reports

### Security Officer
- Receive job notifications
- Accept or decline jobs
- Submit check-ins and photos
- Receive confirmations and reminders

## 8. Non-Functional Requirements

### Performance
- Job broadcast within 5 seconds
- Photo upload confirmation within 3 seconds

### Security
- Secure WhatsApp Business API integration
- Encrypted media storage
- Access control by role

### Reliability
- Retry logic for failed uploads
- Graceful handling of network interruptions

## 9. Assumptions & Constraints

### Assumptions
- All officers use WhatsApp
- GPS permissions are enabled on officer devices

### Constraints
- WhatsApp API rate limits
- GPS accuracy depends on device and environment

## 10. MVP Delivery Timeline

| Week | Deliverable |
|---|---|
| Week 1 | Infrastructure & WhatsApp API setup |
| Week 2–3 | Job, assignment, and attendance flows |
| Week 4 | Reporting & email delivery |
| Week 5 | End-to-end testing & pilot launch |

## 11. Future Enhancements (Post-MVP)

- Web admin dashboard
- Officer performance analytics
- Payroll integration
- Multi-company support
- AI-based attendance anomaly detection
