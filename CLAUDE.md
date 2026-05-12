# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

PilotNow is a workforce operations platform for security manpower companies in Singapore — a web application with WhatsApp-integrated field execution. **This repository currently contains product documentation and a UI design prototype only — there is no application source code, build system, or test suite yet.** Do not assume a framework, package manager, or CI pipeline exists; check before suggesting `npm`/`pnpm`/test commands.

## Repository layout

- `docs/product/` — the source of truth for what PilotNow does. Follows the NexStack product-owner workflow (numbered files):
  - `01-discovery-brief.md`, `02-scope-v01.md` (currently v0.2 content), `03-prd.md` — read these first; `03-prd.md` is the active requirement source.
  - `04-user-stories/` — `US-NNN-*.md`, one story per file (US-001…US-018).
  - `05-ux-flows/` — `flow-*.md`, one end-to-end flow per file (job creation, assignment, check-in/out, periodic photos, escalation, DO report, signature page).
  - `06-change-requests/` — `CR-TEMPLATE.md` plus any CRs.
  - `07-release-checklist.md`, `archive/` (superseded versions).
- `design/` — exported HTML/CSS/JS prototype of the admin web app (from claude.ai/design). Not production code; recreate visually if/when building the real app.
- `README.md` — short project framing.

## Working with the docs

- The repo started from an MVP framing but the **current direction is the full end-to-end operating model**, phased in delivery afterward. Older MVP pricing/budget/scope references are deliberately retired — do not reintroduce them as product framing.
- Keep the numbered-file structure intact. New user stories → new `US-NNN-*.md` file; new flows → new `flow-*.md` file. When scope changes, update `03-prd.md` and align `04-user-stories/` and `05-ux-flows/` to it; move old versions to `archive/` rather than deleting.
- Each major doc has a metadata table (Project / Version / Status / Author / Last Updated) and revision history — bump these when editing.

## The `design/` prototype

Static, runs in a browser (open `design/index.html` — needs internet for CDN-loaded React 18, Babel standalone, Lucide icons, and Geist fonts; viewport is fixed at 1280px wide).

Architecture of the prototype:
- `index.html` loads, in order: `data.js` → `primitives.jsx` → `screens/*.jsx` → `app.jsx`. All `.jsx` is compiled in-browser by Babel standalone (`type="text/babel"`); there is no build step.
- `data.js` defines `window.PN_DATA` (officers, clients, sites, jobs, exceptions) — SG-flavored seed data; everything is keyed by id (`O-*`, `C-*`, `S-*`, `J-*`, `EX-*`) and joined via the `officerById` / `siteById` / `clientById` helpers.
- `primitives.jsx` puts shared components and helpers on `window` (`Avatar`, `AvatarStack`, `StatusChip`, `SevDot`, `Icon`, `cx`). Screen files reference these as globals (see the `/* global ... */` header in each file).
- `app.jsx` is the shell: `Rail` (nav), `Topbar`, `TweaksFAB` (light/dark theme + compact/comfortable density, applied via `data-theme` / `data-density` on `<html>`), and `App` which routes between screens. The EXPORT rail items (`signature.html`, `do-report.html`) open as standalone pages in new tabs.
- `screens/scheduling.jsx` is the hero screen — Kanban / Timeline / Table views of jobs. Other screens: `ops.jsx` (live exceptions console), `job-detail.jsx`, `master.jsx`, `reports.jsx`.
- `styles/tokens.css` = design tokens (Geist / Geist Mono, light theme + `data-theme="dark"` overrides, hairline borders, red used only functionally); `styles/app.css` = layout/component styles on top.

Editorial visual language: mono kickers/eyebrows, hairline grids, functional red only, compact density by default.
