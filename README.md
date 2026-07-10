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

## Monorepo Structure

```
pilotnow/
├── apps/
│   ├── web/                  # Admin web UI (Next.js, port 3000)
│   └── api/                  # Web API + MCP endpoint (Hono, port 4000)
├── packages/
│   ├── api-client/           # Shared HTTP client wrapper
│   ├── db/                   # Drizzle ORM, Postgres schema, migrations
│   ├── shared/               # Shared status models and actor types
│   └── typescript-config/    # Shared TypeScript config
├── docs/                     # Product documentation
├── design/                   # Static admin prototype
└── docker-compose.yml        # Local Postgres service
```

This is a **Turbo-powered monorepo** using pnpm workspaces. Run project commands from the repository root folder:

```bash
cd pilotnow
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker

### Installation

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

3. **Start Postgres**

   ```bash
   docker-compose up -d
   ```

4. **Push the database schema**

   ```bash
   pnpm db:push
   ```

## Running The Project

### Run All Applications From Root

```bash
pnpm dev
```

This starts:

- `apps/web` → Next.js admin UI at `http://localhost:3000`
- `apps/api/src/index.ts` → Hono API at `http://localhost:4000`

### Run Individual Applications

1. **Web App** (Port 3000)

   ```bash
   # From root directory
   pnpm --filter @pilotnow/web dev
   ```

2. **API Server** (Port 4000)

   ```bash
   # From root directory
   pnpm --filter @pilotnow/api dev
   ```

3. **Database Studio**

   ```bash
   # From root directory
   pnpm db:studio
   ```

### Local URLs

- Web app: `http://localhost:3000`
- API health check: `http://localhost:4000/health`
- MCP endpoint: `http://localhost:4000/mcp`

## Development Commands

```bash
# Build all apps and packages
pnpm build

# Typecheck all apps and packages
pnpm typecheck

# Push Drizzle schema to local Postgres
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

## License

Proprietary – NexStack Pte Ltd
