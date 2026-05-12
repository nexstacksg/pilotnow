# Discovery Brief

| Field | Value |
|-------|-------|
| **Client** | PilotNow (NexStack Pte Ltd) |
| **Contact** | Ken Ling, Product Owner, @ken88ling |
| **Industry** | Security Manpower / Workforce Management |
| **Date** | 2026-05-12 |
| **Captured by** | Aira |

---

## 1. Business Context

Security manpower companies in Singapore still run daily operations through fragmented WhatsApp chats, calls, spreadsheets, and paper DO processes. PilotNow is intended to become a full operations platform for this segment: not just faster job creation, but a complete operating system for job intake, staffing, field attendance proof, escalations, reporting, sign-off, and finance handoff.

The earlier documentation positioned the product as an MVP-first build. The project direction has now shifted: the requirement set should describe the **full business workflow** and **full baseline product** even if engineering delivery is phased.

## 2. Problem Statement

Current operations are manual, slow, and operationally fragile:

- **Job intake:** Requests come in from multiple chats and formats, causing duplicate entry and missed details
- **Scheduling:** Matching officers to jobs is manual and conflict-prone
- **Execution visibility:** Ops teams chase officers for acknowledgement, check-in, proof, and checkout
- **Evidence quality:** Attendance proof is inconsistent; GPS, timestamps, photos, and remarks are not centrally managed
- **Exception handling:** No-shows, missed proofs, and site issues are handled ad hoc
- **Sign-off & billing:** DO signatures and finance delivery are delayed, incomplete, or hard to audit
- **Management visibility:** There is no reliable operational history for disputes, performance review, or service analysis

The product opportunity is to replace this fragmented operating model with a single, traceable workflow from request intake to finance-ready closure.

## 3. Target Users & Personas

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| Admin / Ops Manager | Operations staff managing daily job creation, staffing, attendance, and customer follow-through | Fast execution, visibility, exception handling, accurate reporting |
| Dispatcher / Scheduler | Planner responsible for coverage, shift balance, and rapid reassignments | Conflict detection, resource visibility, staffing control |
| Security Officer | Field worker using WhatsApp on-site | Clear instructions, simple proof submission, low-friction shift flow |
| Site Manager (External) | Client-side contact who verifies attendance and signs off reports | Simple, trustworthy sign-off workflow |
| Finance Team | Internal or client-side recipients of reports for billing | Timely, accurate, traceable report delivery |
| Management / Operations Lead | Needs operational visibility across jobs, incidents, exceptions, and delivery performance | Dashboards, auditability, exportable history |

## 4. Key Goals & Success Metrics

| Goal | Success Metric | Target Direction |
|------|---------------|------------------|
| Reduce admin effort per job | Time from intake to staffed job | Significant reduction vs manual baseline |
| Improve staffing reliability | Acknowledged and covered shifts before start | High coverage with early exception visibility |
| Achieve verifiable attendance | GPS + timestamp + photo audit trail | Full evidence for all attended shifts |
| Improve exception response | Time to detect and act on no-shows / misses | Near real-time escalation |
| Accelerate billing readiness | Time from shift completion to finance-ready report | Same-day closure where possible |
| Improve operational accountability | Searchable historical evidence and audit trace | Full job-level traceability |

## 5. Constraints

| Constraint | Details |
|------------|---------|
| **Operational model** | WhatsApp remains primary for field staff, but admin visibility cannot remain chat-only |
| **Technology** | GreenAPI for messaging, LLM parsing, secure media/report storage, email delivery, GPS validation |
| **Compliance** | PDPA-aware handling of GPS, photos, personal data, signatures, and retention policies is required |
| **Reliability** | Messaging failures, GPS inaccuracy, and human non-response must all have recovery flows |
| **Commercial** | Previous MVP commercial references should not constrain full requirement design |

## 6. Competitive Landscape

| Competitor / Alternative | What They Do Well | What They Lack |
|--------------------------|-------------------|----------------|
| Manual WhatsApp + phone calls | Familiar, zero learning curve | No structure, no audit, no automation |
| Generic workforce management apps | Rich admin tooling | Weak field adoption when officers live in WhatsApp |
| Security guard ops handled via spreadsheets + PDFs | Cheap and familiar | Fragile, delayed, poor evidence quality |

## 7. Stakeholders

| Name | Role | Involvement | Decision Power |
|------|------|-------------|----------------|
| Ken Ling | Product Owner / NexStack Founder | Daily | Final |

## 8. Product Direction Notes

- PilotNow should be defined as a **full operations platform**, not only a pilot deployment
- WhatsApp-first execution is a strength, but admin operations need structured management surfaces and history
- Client/site/officer master data is core, not optional
- Exception handling is product-critical, not just an edge-case feature
- Reporting must serve both day-to-day ops and downstream audit / billing needs
- Finance handoff, compliance, retention, and traceability are in baseline scope

### Historical References Retained

- Initial scale assumption: 1,000 officers / jobs per day
- Tech stack direction: Hono.js, PostgreSQL, DigitalOcean, GreenAPI, Gemini, OpenAI

These references remain useful as background only; they should not limit the full requirement definition.

---

**Next step:** [02-scope-v01.md](02-scope-v01.md)
