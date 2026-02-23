# TOOLS.md - Tech Stack & Integrations

## Tech Stack

> TODO: Finalize with Ken

| Component | Technology | Status |
|---|---|---|
| WhatsApp BSP | GreenAPI | ✅ Approved |
| LLM (job parsing) | TBD | |
| Backend | TBD | |
| Database | TBD | |
| File Storage | TBD | Photos, GPS data, PDFs |
| Email Service | TBD | DO report delivery |
| PDF Generation | TBD | DO reports |
| Hosting | TBD | |

## GreenAPI

- WhatsApp Business API provider
- Account: already approved
- Phone number: TBD
- Docs: https://green-api.com/en/docs/

## Key Integrations

### WhatsApp (GreenAPI)
- Webhook for incoming messages (text, photos, location, button callbacks)
- Outbound: text, buttons, media messages
- Rate limits: check GreenAPI docs

### LLM Service
- Input: admin's free-form WhatsApp message
- Output: structured job object (site, date, time, officer count, requirements)
- Keep token usage lean — job descriptions are short

### Email
- Send DO report PDF to finance
- Configurable recipient per job/client

### Digital Signature Page
- One-time web link for site managers
- Verify: mobile number + IC last 4 digits
- 1 hour expiry

## Environment

- **Repo:** github.com/nexstacksg/pilotnow
- **Org:** NexStack Pte Ltd

---

Update this file as tech decisions are made.
