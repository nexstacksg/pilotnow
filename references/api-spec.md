# PilotNow – API Specification

> TODO: Finalize after tech stack decision

## Table of Contents

1. [Overview](#overview)
2. [Webhook Endpoints](#webhook-endpoints)
3. [Internal API](#internal-api)
4. [Signature Page](#signature-page)

---

## Overview

The backend exposes:
- **Webhook endpoints** for GreenAPI WhatsApp messages
- **Internal API** for job management, assignments, and reporting
- **Public signature page** for site manager DO report signing

## Webhook Endpoints

### POST /webhooks/greenapi
Receives incoming WhatsApp messages from GreenAPI.

**Handles:**
- Admin text messages → LLM parsing → job creation
- Admin button callbacks → job confirmation, assignment, escalation actions
- Officer photo + location → check-in validation
- Officer button callbacks → assignment acknowledgement

## Internal API

### Jobs

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/jobs | Create job (from LLM-parsed data) |
| GET | /api/jobs/:id | Get job details |
| PATCH | /api/jobs/:id | Edit job |
| DELETE | /api/jobs/:id | Cancel job |
| GET | /api/jobs | List jobs (with filters) |

### Assignments

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/jobs/:id/assign | Assign officers to job |
| PATCH | /api/assignments/:id | Update assignment (reassign, status) |
| GET | /api/jobs/:id/assignments | List assignments for job |

### Check-Ins

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/checkins | Record check-in (GPS + photo) |
| GET | /api/jobs/:id/checkins | List check-ins for job |

### DO Reports

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/jobs/:id/report | Generate DO report |
| GET | /api/reports/:id | Get report details |
| POST | /api/reports/:id/send | Email report to finance |

### Officers

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/officers | List officers |
| GET | /api/officers/available | List available officers |
| GET | /api/officers/:id | Get officer details |

### Sites

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/sites | Create site |
| GET | /api/sites/:id | Get site details |
| PATCH | /api/sites/:id | Update site (incl. GPS radius) |

## Signature Page

### GET /sign/:token
Renders the digital signature page for site managers.

**Flow:**
1. Page loads with job summary
2. Site manager enters mobile number + IC last 4 digits
3. System verifies against stored site manager info
4. Signature pad presented
5. On sign → signature stored, report finalized
6. Token expires after 1 hour
