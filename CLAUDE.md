# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

PilotNow is a workforce operations platform for security manpower companies in Singapore — a web application with WhatsApp-integrated field execution. The repository contains the product documentation (`docs/`), UI design prototypes (`design/`, `Latest Design/`), and the application source: a **Turborepo + pnpm monorepo** (`apps/`, `packages/`) — Next.js web admin, Hono Web API with an MCP endpoint, Drizzle ORM over Postgres. There is no test suite or CI pipeline yet.

## Application monorepo (`apps/`, `packages/`)

Turborepo + pnpm workspace implementing the PRD v2.2 architecture (single Web API door; pure software core; MCP for external agents):

- `apps/web` — Next.js admin app, **port 3000**. Pure UI: no business logic; all data via the Web API. API access is configured once in `lib/api.ts` (`http` from `@pilotnow/api-client`) — components call `http.get/post/put/delete` and never repeat base URL or headers. Visual direction: `Latest Design/`.
- `apps/api` — Hono Web API, **port 4000** (`API_PORT`). The single entry point; all business rules live here. `src/app.ts` mounts routes per PRD FR groups (jobs, officers, assignments, proofs, payables, billing) plus the **MCP tool surface at `/mcp`** via `@hono/mcp` (Streamable HTTP) — `src/mcp/server.ts`, kept thin per FR-034. `src/middleware/identity.ts` resolves every caller to a HUMAN or AGENT actor (FR-035; agents send `x-agent-token`).
- `packages/db` — Drizzle ORM schema (`src/schema/index.ts`: customers, sites, officers, jobs, job_assignments, proof_photos, audit_events) + `createDb()` client (node-postgres). Migrations via drizzle-kit.
- `packages/shared` — domain constants/types (PRD §6 status models, `Actor`, `RECORD_STATE` for draft-and-confirm). Keep in sync with the pgEnums in `packages/db`.
- `packages/api-client` — dependency-free `http` client factory (`createHttpClient` / `createAgentHttpClient`): base URL + headers set once, JSON parsing + `HttpError` built in.
- `packages/typescript-config` — shared tsconfig bases (`base.json`, `nextjs.json`).

Commands (from repo root): `pnpm install`; `docker-compose up -d` (Postgres 17 on 5432, creds `pilotnow`/`pilotnow`); `pnpm dev` (all apps via turbo); `pnpm build`; `pnpm typecheck`; `pnpm db:push` / `pnpm db:studio` (drizzle-kit against `DATABASE_URL`). Copy `.env.example` to `.env` first.

## Repository layout

- `docs/product/` — the source of truth for what PilotNow does. Follows the NexStack product-owner workflow (numbered files):
  - `01-discovery-brief.md`, `02-scope-v01.md` (currently v0.2 content), `03-prd.md` — read these first; `03-prd.md` is the active requirement source (v2.2).
  - `04-user-stories/` — `US-NNN-*.md`, one story per file (US-001…US-019).
  - `05-ux-flows/` — `flow-*.md`, one end-to-end flow per file (job creation, recurring jobs, assignment, check-in/out, periodic photos, escalation, DO report, signature page).
  - `06-change-requests/` — `CR-TEMPLATE.md` plus any CRs.
  - `07-release-checklist.md`, `archive/` (superseded versions, e.g. the v2.0 PRD).
- `design/` — older multi-file HTML/CSS/JSX prototype of the admin web app (from claude.ai/design). Not production code.
- `Latest Design/` — the most recent PilotNow Admin design export (single-file, different architecture — see below). This is the current visual direction.
- `README.md` — short project framing.

## Working with the docs

- The active framing is **PRD v2.2**: the admin-led Kestrel operating flow — customer request → admin job creation → WhatsApp officer sourcing → onboarding/rate agreement → assignment → hourly proof → completion → officer payable computation (UNPAID/PAID) → customer billing status. **AI is positioned as a supporting worker, not the main operational stream** (FR-032) — AI may parse, draft, remind, and flag, but must not own the workflow or mark payments PAID. Don't write new docs that make AI autonomous unless a CR approves it (US-019 covers the AI order-to-fulfilment aspiration and sits in the backlog).
- **Architecture boundary (PRD v2.2, Section 1.1 + FR-033–FR-036): the PilotNow software contains no AI/LLM element.** The core is pure software (web UI → single Web API → logic → DB). All AI capability is delivered by **external agents** (e.g. Hermes, OpenClaw) that connect through a thin **MCP tool surface** over the Web API, guided by skills, under a restricted agent identity with draft-and-confirm guardrails. When writing docs, never describe AI as a feature inside PilotNow — describe it as the external agent layer calling MCP tools.
- The repo started from an MVP framing but moved to the full end-to-end operating model, phased in delivery afterward. Older MVP pricing/budget/scope references are deliberately retired — do not reintroduce them as product framing.
- Keep the numbered-file structure intact. New user stories → new `US-NNN-*.md` file; new flows → new `flow-*.md` file. When scope changes, update `03-prd.md` and align `04-user-stories/` and `05-ux-flows/` to it; move old versions to `archive/` rather than deleting.
- Each major doc has a metadata table (Project / Version / Status / Author / Last Updated) and revision history — bump these when editing.

## The `design/` prototype

Static, runs in a browser (open `design/index.html` — needs internet for CDN-loaded React 18, Babel standalone, Lucide icons, and Geist fonts; viewport is fixed at 1280px wide).

Architecture of the prototype:
- `index.html` loads, in order: `data.js` → `primitives.jsx` → `screens/*.jsx` → `app.jsx`. All `.jsx` is compiled in-browser by Babel standalone (`type="text/babel"`); there is no build step.
- `data.js` defines `window.PN_DATA` (officers, clients, sites, jobs, exceptions) — SG-flavored seed data; everything is keyed by id (`O-*`, `C-*`, `S-*`, `J-*`, `EX-*`) and joined via the `officerById` / `siteById` / `clientById` helpers.
- `primitives.jsx` puts shared components and helpers on `window` (`Avatar`, `AvatarStack`, `StatusChip`, `SevDot`, `Icon`, `cx`). Screen files reference these as globals (see the `/* global ... */` header in each file).
- `app.jsx` is the shell: `Rail` (nav, sections OPERATE / MANAGE / SETUP / FIELD & DELIVERABLES), `Topbar`, `TweaksFAB` (light/dark theme + compact/comfortable density, applied via `data-theme` / `data-density` on `<html>`), and `App` which routes between screens (string `active` state; `fromScreen` tracks where job-detail / create were entered from so "back" returns there).
- Screens (each registers `window.XxxScreen`): `scheduling.jsx` (hero — Kanban / Timeline / Table; `onNew(mode)` opens create), `ops.jsx` (live exceptions console), `jobs.jsx` (full job register), `job-detail.jsx`, `create.jsx` (`CreateJobScreen`, `mode` = `single` | `recurring`, with NL-intake mock), `client-portal.jsx` (read-only client view), `finance.jsx` (DO assembly + email delivery queue), `master.jsx`, `reports.jsx`, `settings.jsx` (tenant operating rules). Screens take `onSelectJob` / `onNew` callbacks from `App`.
- `preview.jsx` registers `OfficerScreen` / `SignatureScreen` / `DoReportScreen` (the FIELD & DELIVERABLES rail items), which embed the standalone artifacts `officer.html`, `signature.html`, `do-report.html` in phone/paper frames in-app, with "Open full" buttons that open them in new tabs.
- A new screen = a `screens/*.jsx` file (`window.XxxScreen`), a `<script type="text/babel" src=...>` line in `index.html` *before* `app.jsx`, an entry in `NAV` + `titleMap` + the routing if/else in `app.jsx`, and a unique alias for any `React` hooks destructured at module scope (e.g. `useStateJ`) — all `.jsx` files share one global scope, so bare `const { useState } = React` in two files collides.
- Styles cascade `tokens.css` → `kit.css` → `app.css` (later wins on conflicts). `tokens.css` = design tokens (Geist / Geist Mono, light theme + `data-theme="dark"` overrides, hairline borders, red used only functionally). `kit.css` = generic shared kit (button bases, inputs, etc.). `app.css` = PilotNow layout/component styles + form/settings helpers (`.form-card`, `.set-row`, `.switch`, `.del-dot`, …).

Editorial visual language: mono kickers/eyebrows, hairline grids, functional red only, compact density by default.

## `Latest Design/`

A newer claude.ai/design export of the PilotNow Admin app, in a different format from `design/`:
- The entire app is one document: `index.html` (identical to `PilotNow Admin.dc.html`) — an `<x-dc>` document with the full markup inline, template bindings like `{{ navTo.jobs }}` / `{{ navStyle.jobs }}`, and its logic in a `<script type="text/x-dc" data-dc-script>` block. It is hydrated at load time by `support.js`, a **generated** runtime (do not edit; header says rebuild from `dc-runtime/` with bun — that source is not in this repo) which pulls React 18, ReactDOM, and Babel standalone from unpkg. Open `index.html` in a browser (needs internet); `image-slot.js` and `.image-slots.state.json` handle image placeholders.
- Screens (via the sidebar nav bindings): dashboard, jobs, officers, summary, payments, billing, reports — note this reflects the PRD v2.1 flow (payments/billing) rather than the older `design/` screen set.
- `uploads/` holds reference material: flow-diagram and report images, and the full **Taskimoo Design System** (NexStack's internal brand system — Geist type, black-and-white with one functional red, hairline borders; it has its own `readme.md` and `SKILL.md`). It informs the visual language but is Taskimoo-branded, not PilotNow's own system.

## OpenSpec (spec-driven change workflow)

The repo uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for spec-driven change management, initialized with the `spec-driven` schema:

- `openspec/` — `config.yaml` (schema + optional project context/rules), `specs/` (agreed capability specs), `changes/` (in-flight change proposals; completed ones move to `changes/archive/`).
- Slash commands (generated in `.claude/commands/opsx/`): `/opsx:propose` (create a change with proposal/design/tasks artifacts), `/opsx:explore`, `/opsx:apply`, `/opsx:sync`, `/opsx:archive`. Backing skills live in `.claude/skills/openspec-*/`.
- MCP server: `.mcp.json` registers `openspec` (runs `npx -y openspec-mcp`, the community [openspec-mcp](https://github.com/Lumiaqian/openspec-mcp) server — not published by Fission-AI). It exposes `openspec_list_changes`, `openspec_show_change`, `openspec_validate_*`, `openspec_archive_change`, review/approval tools, etc. Prefer these tools over shelling out to the `openspec` CLI.
- Workflow: significant product/doc/prototype changes should start as an OpenSpec change proposal, get validated (`openspec_validate_change`), be applied, then archived — keeping `openspec/specs/` consistent with `docs/product/03-prd.md` (the PRD remains the product source of truth; OpenSpec tracks the change process).

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **pilotnow** (922 symbols, 968 relationships, 5 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/pilotnow/context` | Codebase overview, check index freshness |
| `gitnexus://repo/pilotnow/clusters` | All functional areas |
| `gitnexus://repo/pilotnow/processes` | All execution flows |
| `gitnexus://repo/pilotnow/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
