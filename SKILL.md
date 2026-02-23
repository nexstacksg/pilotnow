---
name: pilotnow
description: Build and maintain PilotNow — a WhatsApp-first workforce management system for security manpower companies. Use when working on PilotNow features including job management, officer assignment, GPS attendance tracking, photo proof collection, DO report generation, and WhatsApp integration via GreenAPI. Covers the full product: backend, WhatsApp flows, LLM job parsing, digital signatures, and PDF reporting.
---

# PilotNow – Smart Workforce Management via WhatsApp

WhatsApp-first system enabling security companies to manage jobs, officers, attendance proof, and billing — all through WhatsApp, powered by LLM parsing and automation.

## Product Overview

- **Target users:** Security manpower companies
- **Primary interface:** WhatsApp (via GreenAPI)
- **Admin** creates jobs via natural language WhatsApp messages → LLM parses into structured data
- **Officers** receive assignments, submit GPS + photo check-ins, get periodic reminders
- **Site Managers** sign DO reports via mobile-verified web link
- **Finance** receives auto-generated PDF DO reports via email

## Architecture

See [references/architecture.md](references/architecture.md) for system architecture, tech stack, and integration details.

## User Roles

| Role | Type | Interface |
|---|---|---|
| Admin / Ops Manager | System user | WhatsApp |
| Security Officer | System user | WhatsApp |
| Customer | External | WhatsApp / Email (sends job requests) |
| Site Manager | External | One-time web link (DO signature) |
| Finance Team | External | Email (receives DO PDF) |

## Core Flows

### 1. Job Creation (Admin)

```
Customer sends job request → Admin receives
  → Admin describes job in WhatsApp (natural language)
  → LLM parses into structured job data
  → Admin confirms → Job created
```

- LLM-powered parsing (not template-based)
- Supports recurring jobs (same site, same time, weekly)

### 2. Officer Assignment (Admin-Driven)

```
Admin selects officers for job
  → Officers receive assignment notification
  → Officers acknowledge
```

- Admin assigns — not officer self-selection
- One job can have multiple officers
- One officer cannot have concurrent jobs
- Max 3 shifts per job

### 3. Attendance & Proof (Officer)

```
Officer arrives → submits GPS + photo check-in
  → System validates GPS (default 100m, configurable per site)
  → Periodic photo reminders (frequency per job type)
  → Missed photo → immediate admin alert
  → No check-in within 10 min → automated escalation
```

### 4. Job Completion & DO Report

```
Shift ends → DO report auto-generated (PDF)
  → Signature link sent to Site Manager
  → Site Manager verifies: mobile number + IC last 4 digits
  → Signs digitally
  → If unsigned after 1 hour → escalation
  → Signed PDF emailed to finance
```

DO report contains: job details, timestamps, GPS data, photos, officer remarks, incident notes, signature.

## Key Technical Decisions

| Decision | Choice |
|---|---|
| WhatsApp BSP | GreenAPI |
| Job parsing | LLM-powered (free-form natural language) |
| GPS radius | 100m default, configurable per site |
| Signature verification | Mobile number + IC last 4 digits |
| Assignment model | Admin-driven (not self-selection) |
| Concurrency | 1 officer = 1 job at a time |
| Recurring jobs | Supported |
| No-show escalation | Automated, 10 min threshold |

## References

- [PRD (full requirements)](references/prd.md) — complete functional and non-functional requirements
- [Architecture](references/architecture.md) — system design, tech stack, integrations
- [Data Model](references/data-model.md) — database schema and entity relationships
- [WhatsApp Flows](references/whatsapp-flows.md) — message templates, button layouts, conversation flows
- [API Spec](references/api-spec.md) — backend API endpoints

## MVP Timeline (8 weeks)

| Week | Deliverable |
|---|---|
| 1–2 | Infrastructure, GreenAPI setup, LLM integration |
| 3–4 | Job creation, assignment, notification flows |
| 5–6 | Attendance, GPS check-in, photo proof, escalation |
| 7 | DO reporting, digital signature, email delivery |
| 8 | End-to-end testing & pilot launch |
