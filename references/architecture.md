# PilotNow – Architecture

> TODO: Finalize tech stack decisions

## Table of Contents

1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Integrations](#integrations)
4. [Infrastructure](#infrastructure)

---

## System Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  WhatsApp    │────▶│  GreenAPI    │────▶│  PilotNow API   │
│  (Admin &    │◀────│  (BSP)       │◀────│  (Backend)      │
│   Officers)  │     └──────────────┘     └────────┬────────┘
└─────────────┘                                    │
                                              ┌────┴────┐
                                              │         │
                                         ┌────▼───┐ ┌───▼────┐
                                         │ LLM    │ │Database│
                                         │Service │ │        │
                                         └────────┘ └────────┘
                                              
┌─────────────┐     ┌──────────────┐
│Site Manager  │────▶│ Signature    │──── Verify mobile + IC
│  (Browser)   │     │ Web Page     │──── Capture signature
└─────────────┘     └──────────────┘

┌─────────────┐     ┌──────────────┐
│ Finance      │◀────│ Email Service│──── Send DO report PDF
└─────────────┘     └──────────────┘
```

## Tech Stack

> TODO: Confirm with team

| Component | Technology | Notes |
|---|---|---|
| Backend | TBD | |
| Database | TBD | |
| WhatsApp BSP | GreenAPI | Already approved |
| LLM | TBD | For job parsing |
| File Storage | TBD | Photos, GPS data, PDFs |
| Email | TBD | DO report delivery |
| PDF Generation | TBD | DO reports |
| Hosting | TBD | |

## Integrations

### GreenAPI (WhatsApp)
- Webhook for incoming messages
- Send text, buttons, media
- Rate limit awareness required

### LLM Service
- Parse natural language job descriptions → structured data
- Input: admin's free-form WhatsApp message
- Output: structured job object (site, date, time, requirements, etc.)

### Email Service
- Send DO report PDFs to finance
- Configurable recipient per job/client

### Signature Web Page
- One-time link for site manager
- Verify: mobile number + IC last 4 digits
- Capture digital signature
- 1 hour timeout

## Infrastructure

> TODO: Define hosting, CI/CD, monitoring
