# PilotNow – Product Requirements Document

Version: MVP – Admin & Security Officer Only
Prepared By: NexStack Pte Ltd

## Table of Contents

1. [Background & Problem Statement](#1-background--problem-statement)
2. [Vision & Objectives](#2-vision--objectives)
3. [User Roles](#3-user-roles)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Out of Scope](#6-out-of-scope)
7. [Assumptions & Constraints](#7-assumptions--constraints)
8. [Future Enhancements](#8-future-enhancements)

---

## 1. Background & Problem Statement

Security manpower companies rely on WhatsApp, phone calls, and paper-based processes to manage jobs, officers, attendance proof, and billing. These workflows are manual, time-consuming, error-prone, and difficult to scale.

Problems:
- Manual job posting: 10–15 minutes per job
- Hard to track job acceptance in busy WhatsApp chats
- Frequent phone calls to chase officers for check-ins and photos
- Missing or unreliable attendance proof (no GPS, timestamps)
- Paper-based signatures: delayed or lost
- Slow DO report preparation: delayed billing and cash-flow gaps

## 2. Vision & Objectives

**Vision:** Enable security companies to manage their workforce end-to-end using WhatsApp, powered by automation and AI.

**MVP Objectives:**
- Reduce administrative effort for job management
- Ensure 100% verifiable attendance proof
- Improve officer experience with clear, simple workflows
- Generate DO reports automatically for faster billing

**Success Metrics:**

| Metric | Target |
|---|---|
| Admin time reduction per job | ≥80% |
| GPS + timestamp + photo coverage | 100% |
| DO report generation | Immediately after job completion |
| Billing initiation | Within 24 hours |

## 3. User Roles

### System Users

**Admin / Operations Manager**
- Receive job requests from customers
- Create and manage jobs via WhatsApp (natural language → LLM parsing)
- Assign officers to jobs
- Monitor attendance, GPS check-ins, photo proof
- Generate and send DO reports

**Security Officer**
- Receive assignment notifications via WhatsApp
- Acknowledge assignments
- Perform GPS + photo check-ins
- Submit periodic site photos
- Complete assigned duties

### External Actors (No accounts)

- **Customer:** Sends job requests to PilotNow (WhatsApp/email)
- **Site Manager:** Signs DO report via one-time web link (mobile + IC last 4 digits verification)
- **Finance Team:** Receives DO report PDF via email

## 4. Functional Requirements

### Job Management
- Natural language job creation via WhatsApp
- LLM-powered parsing (free-form → structured data)
- Job edit and cancellation
- Recurring job support (weekly)

### Assignment Management
- Admin-driven officer assignment
- Multi-officer per job
- Single-job constraint per officer (no concurrent jobs)
- Max 3 shifts per job
- Assignment notifications to officers

### Attendance & Proof
- GPS-verified photo check-in (100m default, configurable per site)
- Automatic timestamping
- Periodic photo reminders (frequency per job type)
- Missed proof → immediate admin alert
- No-show → automated escalation after 10 minutes
- Admin can reassign on no-show

### DO Reporting
- Auto-generated PDF on job completion
- Contents: job details, timestamps, GPS, photos, remarks, incident notes, signature
- Digital signature via web link (mobile + IC last 4 digits verification)
- Signature timeout: 1 hour → escalation
- Email delivery to finance (configurable recipient per job/client)

## 5. Non-Functional Requirements

### Performance
- Job broadcast within 5 seconds
- Photo upload confirmation within 3 seconds

### Security
- GreenAPI WhatsApp integration (secure)
- Encrypted media storage
- Role-based access control
- Site manager verification (mobile + IC last 4 digits)

### Reliability
- Retry logic for failed uploads
- Graceful handling of network interruptions
- Automated escalation for no-shows and missed proofs

## 6. Out of Scope (MVP)

- Web admin dashboard
- Native mobile applications
- Payroll and salary automation
- Advanced analytics and reporting
- Multi-language support
- Finance acknowledgement tracking

## 7. Assumptions & Constraints

**Assumptions:**
- All officers use WhatsApp
- GPS permissions enabled on officer devices
- WhatsApp Business API already approved (GreenAPI)

**Constraints:**
- WhatsApp API rate limits
- GPS accuracy depends on device and environment
- One officer cannot work multiple concurrent jobs
- Max 3 shifts per job

## 8. Future Enhancements (Post-MVP)

- Web admin dashboard
- Officer performance analytics
- Payroll integration
- Multi-company support
- AI-based attendance anomaly detection
- Configurable photo reminder frequency per job
