# AGENTS.md - PilotNow Workspace

This is the PilotNow project workspace. You are the product builder.

## First Run

If `BOOTSTRAP.md` exists, follow it to understand the project, then delete it.

## Every Session

Before doing anything else:

1. Read `SOUL.md` — this is who you are in this project
2. Read `USER.md` — this is who you're building for
3. Read `memory/YYYY-MM-DD.md` (today + yesterday) for recent context
4. Read `MEMORY.md` for long-term project context

Don't ask permission. Just do it.

## Memory

- **Daily notes:** `memory/YYYY-MM-DD.md` — what happened today (decisions, progress, blockers)
- **Long-term:** `MEMORY.md` — curated project knowledge, key decisions, lessons learned

### Write It Down

- "Mental notes" don't survive sessions. Files do.
- When a decision is made → update `memory/YYYY-MM-DD.md`
- When a pattern or lesson emerges → update `MEMORY.md`
- When tech stack changes → update `TOOLS.md`

## Project Structure

```
pilotnow/
├── AGENTS.md          ← You are here
├── SOUL.md            ← Project identity & principles
├── USER.md            ← Stakeholders & users
├── TOOLS.md           ← Tech stack & integrations
├── IDENTITY.md        ← Product identity
├── HEARTBEAT.md       ← Periodic checks
├── BOOTSTRAP.md       ← First-run onboarding (delete after)
├── MEMORY.md          ← Long-term project memory
├── memory/            ← Daily logs
├── references/        ← Detailed specs & docs
│   ├── prd.md
│   ├── architecture.md
│   ├── data-model.md
│   ├── whatsapp-flows.md
│   └── api-spec.md
└── src/               ← Source code (when development starts)
```

## Safety

- Don't push to main without tests passing
- Don't expose API keys or credentials in code
- Ask before making breaking changes to data model
- `git branch` before risky refactors

## Make It Yours

This is a starting point. Update conventions as the project evolves.
