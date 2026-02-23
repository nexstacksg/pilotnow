# Discovery Brief

| Field | Value |
|-------|-------|
| **Client** | PilotNow (NexStack Pte Ltd) |
| **Contact** | Ken Ling, Product Owner, @ken88ling |
| **Industry** | Security Manpower / Workforce Management |
| **Date** | 2026-02-23 |
| **Captured by** | Aira |

---

## 1. Business Context

Security manpower companies in Singapore manage daily operations through WhatsApp group chats, phone calls, spreadsheets, and paper-based processes. PilotNow is a new product by NexStack to replace these manual workflows with a WhatsApp-first automated system. The product targets the security manpower industry specifically, where WhatsApp is already the primary communication channel.

## 2. Problem Statement

Current operations are manual, slow, and error-prone:

- **Job posting:** Takes 10–15 minutes per job, done manually in WhatsApp groups
- **Job tracking:** Difficult to track acceptance in busy group chats
- **Attendance chasing:** Frequent phone calls to officers for check-ins and photos
- **Attendance proof:** Missing or unreliable — no GPS, no timestamps
- **Signatures:** Paper-based DO signatures are delayed or lost
- **Billing:** Slow DO report preparation causes delayed billing and cash-flow gaps

The entire cycle from job creation → officer assignment → attendance tracking → DO report → billing is manual, creating bottlenecks at every step.

## 3. Target Users & Personas

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| Admin / Ops Manager | Operations staff managing 10–50+ officers daily. Moderate tech comfort, fluent with WhatsApp. | Fast job creation, reliable attendance tracking, instant DO reports |
| Security Officer | Field worker at client sites. Has smartphone with WhatsApp + GPS. Basic tech comfort — can tap buttons, send photos. | Clear assignment info, simple check-in, minimal friction |
| Customer (External) | Security company's client who sends job requests. No system account. | Send job requirements via WhatsApp or email |
| Site Manager (External) | Client-side person at security site. Varying tech comfort. No system account. | Sign DO report quickly via web link |
| Finance Team (External) | Receives DO reports for billing. No system interaction. | Timely, complete, accurate PDF reports |

## 4. Key Goals & Success Metrics

| Goal | Success Metric | Target |
|------|---------------|--------|
| Reduce admin effort per job | Admin time from creation to assignment | ≥80% reduction |
| 100% verifiable attendance | GPS + timestamp + photo coverage | 100% of check-ins |
| Faster billing cycle | Time from job completion to DO report | Immediate (auto-generated) |
| Faster invoicing | Time from DO report to billing initiation | Within 24 hours |

## 5. Constraints

| Constraint | Details |
|------------|---------|
| **Budget** | TBD — open item |
| **Timeline** | 8 weeks total for MVP |
| **Technology** | WhatsApp-first via GreenAPI (already approved). LLM for job parsing. |
| **Compliance** | TBD — PDPA considerations for GPS tracking + officer photos |
| **Other** | WhatsApp API rate limits. GPS accuracy depends on device/environment. |

## 6. Competitive Landscape

| Competitor / Alternative | What They Do Well | What They Lack |
|--------------------------|-------------------|----------------|
| Manual WhatsApp + phone calls | Familiar, zero learning curve | Unscalable, no proof, no automation |
| Generic workforce management apps | Feature-rich | Not WhatsApp-native, adoption friction for field officers |
| TBD — open item | — | — |

## 7. Stakeholders

| Name | Role | Involvement | Decision Power |
|------|------|-------------|----------------|
| Ken Ling | Product Owner / NexStack Founder | Daily | Final |

## 8. Raw Notes

- GreenAPI already approved as WhatsApp BSP
- LLM-powered parsing chosen over template-based (admin sends free-form text)
- Assignment is admin-driven, not officer self-selection
- GPS: 100m default radius, configurable per site
- Digital signature verification: mobile number + IC last 4 digits, 1hr timeout
- No-show escalation: automated alert after 10 minutes, admin can reassign
- One officer = one active job at a time (no concurrency)
- One job can have multiple officers
- Max 3 shifts per job
- Recurring jobs supported (weekly)
- Photo reminder frequency defined per job type
- DO report: PDF with job details, timestamps, GPS, photos, remarks, incident notes, signature
- Finance email configurable per job/client

### Resolved Items (2026-02-23)
- Competitors: No direct competitors in SG — current alternative is manual WhatsApp + phone calls
- Budget: 50K SGD for MVP
- Pilot scale: 1,000 officers / jobs per day
- PDPA: Not required for MVP
- Shifts: Flexible, variable duration (not fixed 3-shift model)
- Recurring jobs: Supports both natural language and structured input
- Tech stack: Hono.js (backend), PostgreSQL (database), DigitalOcean (hosting)
- LLM: Google Gemini + OpenAI

---

**Next step:** [02-scope-v01.md](02-scope-v01.md)
