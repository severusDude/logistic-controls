<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Logistic Controls Agent Quick Context

## Project Snapshot

- `logistic-controls` is a research prototype, not a production logistics platform.
- Core proof: RFID package scan + GPS telemetry -> simulated ESP32/Wokwi device -> local Mosquitto MQTT broker -> backend worker -> PostgreSQL/Prisma -> Next.js API/SimCon dashboard.
- Research scale is intentionally small: 1 mobile device, 1 facility, 2-3 deterministic RFID package tags.
- Keep out-of-scope items as limitations or future work: customer portal, RBAC, live map, geofence, notifications, email, ETA/route optimization, multi-tenant deployment, production security hardening, physical hardware procurement, large-scale fleet/package tests.

## Must-Read Rules

- Always use caveman mode.
- Always use Filesystem MCP.
- Always use Next Devtools when interacting with NextJS
- Use Docx Editor MCP to read `docs/Laporan Proyek IoT Logistic Controls.docx`.
- Use Exa MCP for searching or to search relevant papers.
- Before editing Next.js code, read the relevant local guide in `node_modules/next/dist/docs/`.
  - Route handlers: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
  - Server/client components: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
  - Project structure: `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- Route handlers live only under `app/**/route.ts`; do not add legacy `pages/api`.

## Lookup Map

- Product scope and boundaries: `docs/PRD_GPS_Logistic_Package_Tracking_MVP.md`
- Research progress tracker: `docs/IoT_System_Research_Documentation.md`
- Research report draft text: `docs/IoT_System_Research_Draft.md`
- Original DOCX report draft: `docs/Laporan Proyek IoT Logistic Controls.docx`
- Device/firmware behavior and Wokwi scenarios: `docs/IoT_Device_Implementation_Technical_Documentation.md`
- Backend MQTT/API/Prisma implementation notes: `docs/IoT_Backend_Implementation_Technical_Documentation.md`
- Frontend SimCon/dashboard notes: `docs/IoT_Frontend_Implementation_Technical_Documentation.md`
- UI/design conventions: `docs/DESIGN.md`

## Code Map

- App routes and pages: `app/`
  - Dashboard: `app/simcon/page.tsx`
  - API: `app/api/devices`, `app/api/internal/raw-events`, `app/api/packages/[trackingId]/timeline`, `app/api/realtime/stream`
- Backend modules: `lib/backend/`
  - Config: `config.ts`
  - Prisma singleton: `db/prisma.ts`
  - MQTT: `mqtt/subscriber.ts`, `mqtt/publisher.ts`, `mqtt/topic-parser.ts`
  - Zod schemas: `schemas/`
  - Event processors: `processors/`
  - Query shaping: `queries/`
  - SSE snapshot contracts: `realtime/`
- SimCon frontend data/types: `lib/simcon/`, `components/simcon/`
- Prisma schema and seed: `prisma/schema.prisma`, `prisma/seed.ts`
- Worker entrypoint: `scripts/backend-worker.ts`
- Mosquitto config: `docker-compose.yml`, `infra/mosquitto/mosquitto.conf`

## Dev Environment Tips

- Package manager: use `pnpm`; lockfile is `pnpm-lock.yaml`.
- Main scripts:
  - `pnpm dev` starts Next.js.
  - `pnpm build` runs Next.js production build.
  - `pnpm lint` runs ESLint.
  - `pnpm db:generate` regenerates Prisma client into `generated/prisma`.
  - `pnpm db:migrate` runs Prisma migrations.
  - `pnpm db:seed` seeds facility, user, device, and packages.
  - `pnpm broker:up` starts local Mosquitto.
  - `pnpm broker:down` stops compose services.
  - `pnpm worker:dev` starts MQTT ingestion worker.
- Runtime env is based on `.env` / `.env.example`; MQTT and database settings are required for end-to-end worker tests.
- Prisma 7 uses `prisma.config.ts`; datasource URL comes from `DATABASE_URL`, not a URL literal in `schema.prisma`.

## Testing Instructions

- No dedicated `test` script exists in `package.json` yet.
- For code changes, at minimum run:
  - `pnpm lint`
  - `pnpm build`
- For database/backend changes, also run:
  - `pnpm db:generate`
  - `pnpm db:migrate` only when a schema migration is intentionally needed.
  - `pnpm db:seed` when validating seeded research scenarios.
- For end-to-end prototype checks, use this order:
  - `pnpm broker:up`
  - ensure PostgreSQL is running and `DATABASE_URL` is valid
  - `pnpm db:generate`
  - `pnpm db:seed`
  - `pnpm worker:dev`
  - `pnpm dev`
  - verify `/simcon`, `/api/health`, `/api/internal/raw-events`, and `/api/packages/{trackingId}/timeline`
- Firmware/Wokwi verification commands and scenario names are documented in `docs/IoT_Device_Implementation_Technical_Documentation.md`.

## Implementation Guardrails

- Preserve research-prototype boundaries. Do not reintroduce broad product scope unless explicitly requested.
- Prefer existing backend patterns: Zod schema -> raw event persistence -> processor -> query/API shape.
- Keep API routes thin; put reusable logic under `lib/backend/`.
- Device/package tracking is device-centric: RFID identifies package; GPS belongs to mobile device; package location is inferred after scan.
- Unknown RFID tags should be quarantined through `UnknownScan`, not treated as package records.
- Do not claim full production security. Local anonymous MQTT and unauthenticated research APIs are known limitations.
- For UI work, keep `/simcon` focused on operator/research observation: device status, event feed, commands, and timeline evidence.

## PR / Commit Checklist

- Confirm changed scope matches the research boundary documents.
- Run `pnpm lint` and `pnpm build` before committing when code changed.
- If Prisma schema changed, include generated/migration effects intentionally and document the reason.
- Update the relevant docs in `docs/` when behavior, scope, commands, or test evidence changes.
