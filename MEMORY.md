# MEMORY.md - PilotNow Project Memory

## Key Decisions

- **2026-02-23:** Project kickoff. PRD finalized with Ken.
- **2026-02-23:** LLM-powered parsing chosen over template-based (Option B)
- **2026-02-23:** Assignment is admin-driven, not officer self-selection
- **2026-02-23:** GreenAPI confirmed as WhatsApp BSP (already approved)
- **2026-02-23:** GPS radius: 100m default, configurable per site
- **2026-02-23:** Digital signature: mobile + IC last 4 digits verification, 1hr timeout
- **2026-02-23:** No-show escalation: automated, 10 min threshold
- **2026-02-23:** One officer = one active job (no concurrency)
- **2026-02-23:** Recurring jobs supported (weekly)
- **2026-02-23:** Timeline: 8 weeks total

## Open Items

- Tech stack not yet decided (backend, database, hosting, LLM provider)
- GreenAPI phone number TBD
- "3 shift" max — clarify: 3 shifts per job, or 3 shifts per officer per day?
- Recurring jobs UI: admin says "weekly" in natural language? Or structured input?
