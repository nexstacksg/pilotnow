# Repository Guidelines

## Project Structure & Module Organization

PilotNow contains product docs, design prototypes, and the application monorepo. The product source of truth lives in `docs/product/`: start with `01-discovery-brief.md`, `02-scope-v01.md`, and especially `03-prd.md`. User stories belong in `docs/product/04-user-stories/` as `US-NNN-short-title.md`; UX flows belong in `docs/product/05-ux-flows/` as `flow-short-title.md`; obsolete versions go under `docs/product/archive/`.

The application is a Turborepo + pnpm monorepo implementing PRD v2.2's architecture (single Web API door, pure software core, MCP for external agents): `apps/web` (Next.js admin UI, port 3000, no business logic), `apps/api` (Hono Web API, port 4000, all business rules + MCP tool surface at `/mcp` via `@hono/mcp`), `packages/db` (Drizzle ORM + Postgres schema), `packages/shared` (status models / actor types), `packages/api-client` (`http.get/post/put/delete` wrapper — base URL and headers configured once), `packages/typescript-config`.

The static admin prototype lives in `design/`. It loads `data.js`, `primitives.jsx`, `screens/*.jsx`, then `app.jsx` directly in the browser. `Latest Design/` contains uploaded/generated design artifacts and reference material.

Tooling note: `design/` and `Latest Design/` are excluded from GitNexus via `.gitnexusignore`. Do not configure Fallow against these folders; wait until the planned turbo repo/application code is added.

## Build, Test, and Development Commands

From the repo root (pnpm 10, Node ≥ 20; copy `.env.example` to `.env` first):

- `pnpm install` — install workspace dependencies.
- `docker-compose up -d` — Postgres 17 on 5432 (`pilotnow`/`pilotnow`).
- `pnpm dev` — run all apps via turbo (web on 3000, API on 4000).
- `pnpm build` / `pnpm typecheck` — build or typecheck every package.
- `pnpm db:push` / `pnpm db:studio` — drizzle-kit against `DATABASE_URL`.

There is no test suite or CI yet. For the design prototypes:

- Open `design/index.html` in a browser to inspect the older prototype; `design/signature.html` / `design/do-report.html` for standalone export views.
- Use `rg "term" docs/product design apps packages` to search quickly.

## OpenSpec Workflow

OpenSpec is initialized in this repo (`openspec/` — `config.yaml`, `specs/`, `changes/` with `changes/archive/`) and an `openspec` MCP server is registered in `.mcp.json` (`npx -y openspec-mcp`, the community server wrapping the OpenSpec CLI). Use the MCP tools (`openspec_list_changes`, `openspec_show_change`, `openspec_validate_change`, `openspec_archive_change`, …) or the `/opsx:*` slash commands (`propose`, `explore`, `apply`, `sync`, `archive`) rather than raw CLI calls.

Start significant changes as an OpenSpec proposal, validate before applying, and archive when done. `docs/product/03-prd.md` remains the product source of truth; OpenSpec tracks the change process against it.

## Coding Style & Naming Conventions

Keep Markdown concise and structured with clear headings, metadata tables, and revision history where existing documents use them. Preserve the numbered product-document workflow.

For prototype edits, follow the existing browser-global style. New screens should be added as `design/screens/*.jsx`, assigned to `window.XxxScreen`, loaded in `design/index.html` before `app.jsx`, and registered in navigation/routing. Avoid duplicate top-level hook aliases because all JSX files share one global Babel scope.

## Testing Guidelines

For documentation changes, verify consistency across `03-prd.md`, related `04-user-stories/`, and `05-ux-flows/`. For prototype changes, manually open `design/index.html` and test the affected screen, navigation path, theme toggle, and density toggle. Check standalone export pages if finance, signature, or DO report behavior changed.

## Commit & Pull Request Guidelines

Recent commits use short imperative or scoped messages such as `docs: update PilotNow PRD operating flow` and `Add admin UI design prototype and CLAUDE.md`. Keep commits focused.

Pull requests should include a brief summary, affected docs or prototype screens, validation performed, and screenshots for visual changes. Link any relevant issue, change request, or product decision.

## Security & Configuration Tips

This repo is proprietary to NexStack Pte Ltd. Do not commit client secrets, production credentials, private customer data, or WhatsApp/API tokens. Use SG-flavored dummy data in `design/data.js` unless real data has been explicitly approved.

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
