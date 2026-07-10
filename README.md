# PilotNow

**Smart Workforce Management via WhatsApp**

Built by [NexStack Pte Ltd](https://nexstack.sg)

---

PilotNow enables security manpower companies to manage jobs, officers, attendance proof, and billing — all through WhatsApp, powered by LLM automation.

## Documentation

Product docs follow the NexStack product-owner workflow:

```
docs/product/
├── 01-discovery-brief.md    ← ✅ Updated for full product direction
├── 02-scope-v01.md          ← ✅ Updated from MVP scope to full baseline scope
├── 03-prd.md                ← ✅ Active requirement source (being expanded to full flow)
├── 04-user-stories/         ← Align after PRD refresh
├── 05-ux-flows/             ← Align after PRD refresh
├── 06-change-requests/      ← As needed
├── 07-release-checklist.md  ← Before launch
└── archive/                 ← Old versions
```

The repo originally started from an MVP framing. Current direction is to document the **full requirement set and full end-to-end operating flow**, then phase delivery afterward.

Previous MVP pricing/budget references are no longer used as product framing.

## Which Folder To Run

Run the project from the repository root folder:

```bash
cd pilotnow
```

This is a pnpm/Turborepo workspace. You usually do not need to run commands inside each app folder.

```
apps/web      Next.js admin UI, runs on http://localhost:3000
apps/api      Hono Web API, runs on http://localhost:4000
packages/db   Drizzle/Postgres schema and DB client
```

`pnpm dev` starts these app entry points:

- `apps/web` → `next dev --port 3000`
- `apps/api/src/index.ts` → API server entry point

## Run Locally

Requirements: Node 20+, pnpm 10, and Docker.

```bash
cp .env.example .env
pnpm install
docker-compose up -d
pnpm db:push
pnpm dev
```

Open:

- Web app: `http://localhost:3000`
- API health check: `http://localhost:4000/health`

Useful commands:

```bash
pnpm build
pnpm typecheck
pnpm db:studio
```

## License

Proprietary – NexStack Pte Ltd
