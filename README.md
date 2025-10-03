# Lab Orders Lite

Lab Orders Lite is a streamlined workflow for drafting, submitting, and tracking laboratory orders. It pairs a type-safe Next.js backend with a TanStack Query client so clinicians and administrators share the same source of truth.

## Quick Start

### Prerequisites

- Node.js 20+
- PNPM 8+ (`corepack enable` recommended)
- PostgreSQL 16 (local instance or Docker Compose)

### Local Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL` and `SHADOW_DATABASE_URL` for your PostgreSQL instance.
3. Apply schema migrations and seed demo data:
   ```bash
   pnpm prisma:migrate
   pnpm prisma:seed
   ```
4. Start the development server:
   ```bash
   pnpm dev
   ```
   Visit http://localhost:3000 to explore the UI.

### Optional: Dockerized Postgres

```bash
docker compose up -d postgres
pnpm dev
```

The compose file provisions Postgres 16 with credentials that match `.env.example` defaults.

### Core Scripts

- `pnpm dev` – run Next.js locally
- `pnpm build` / `pnpm start` – production build & serve
- `pnpm lint` – ESLint (Next.js base config)
- `pnpm typecheck` – isolated TS program for CI safety
- `pnpm test` – Vitest unit suite (Node + jsdom)
- `pnpm test:integration` – exercises API flows against a live Next.js server and Postgres (requires Docker or local DB)

## Running Tests

### Unit Tests

- Run the full suite: `pnpm test`
- Watch mode during development: `pnpm test -- --watch`
- Coverage (optional): `pnpm test -- --coverage`

### Integration Tests

1. Ensure Postgres is available. The simplest option is Docker:
   ```bash
   docker compose -f docker-compose.test.yml up -d postgres
   ```
2. Copy the integration environment template and adjust credentials if needed:
   ```bash
   cp test.integration.env .env.test
   ```
3. Execute the suite:
   ```bash
   pnpm test:integration
   ```
   This command will migrate a fresh database, seed demo data, boot a Next.js server, and run Supertest scenarios against the live routes.
4. Tear down containers when finished:
   ```bash
   docker compose -f docker-compose.test.yml down
   ```

If you prefer a local Postgres instance, set `DATABASE_URL` and `SHADOW_DATABASE_URL` in `.env.test` accordingly before running `pnpm test:integration`.

## Architecture Overview

- **App Router APIs** live in `app/api`. Handlers share Zod-validated request parsing and Prisma-backed business logic. The same entry points power integration tests via Supertest.
- **Prisma ORM** owns the schema, migrations, and seeding. `OrderItem` rows snapshot pricing/turnaround data and encapsulate calculations via helper utilities in `lib/calculations.ts`.
- **Validation with Zod** keeps runtime guards aligned with TypeScript types, preventing drift between server contracts and UI usage.
- **TanStack Query hooks** inside `hooks/` wrap each resource (patients, lab tests, orders). They provide caching, optimistic updates for status changes, and colocated mutation logic so pages stay declarative.
- **UI layer** uses Tailwind CSS with shadcn/ui primitives. Components favor composition over inheritance; shared helpers (e.g., `formatMoney`) live in `lib/`.

## Notable Decisions

- **PNPM over npm/yarn** – faster installs and strict lockfile integrity.
- **TanStack Query** – removes bespoke loading/error state plumbing while unlocking cache-aware optimistic updates.
- **Vitest instead of Jest** – native ESM support, faster startup, and consistent tooling between unit and integration suites.
- **Prisma over Sequelize** – schema-first migrations, generated types, and straightforward seeding reduced ORM friction.
- **Zod** – runtime validation with inferred static types keeps API and UI contracts synchronized.
- **Dedicated lint/typecheck scripts** – `pnpm lint` and `pnpm typecheck` run independently so automation can fail fast before builds.

## Testing Strategy

- **Unit coverage (56 specs)** – exercises calculations, HTTP helpers, and all Zod schemas to guard request/response shapes.
- **Integration suite (`pnpm test:integration`)** – boots a throwaway Postgres database, spins up the Next.js app, and validates the order lifecycle (create → transition → invalid transitions) end-to-end with Supertest.
- **Test tooling** lives under `test/integration`, including a reusable server harness that resets Prisma state before each run. `docker-compose.test.yml` mirrors the CI workflow so local and automated runs stay aligned.

## Scope Decisions & Trade-offs

- **Patient history / audit trail** – Deferred for now since modeling historical tables would have required significant effort without adding much value to the initial workflows. This can be revisited once real-world usage highlights which historical data is most useful.
- **User management & moderation** – Authentication, roles, and advanced moderation tools were left out because current operators run the tool in a trusted environment. The UI supports only essential status changes to keep things simple but functional. Future versions can introduce authentication, role-based permissions, and bulk moderation when more users and roles emerge.
- **Integration coverage** – Focused on order workflows only (ran out of time to focus on other parts of the integration)

## Known Limitations & Next Steps

- **Known limitations**
  - No user authentication or role-based permissions yet.
  - Turnaround time calculations don’t account for weekends, holidays, or time zones.
  - Search and filtering minimal, with no fuzzy matching or advanced filters.
  - Integration tests currently only cover the order routes; patients and tests are not yet included.
  - No audit log beyond the current order state.
- **Next steps**
  - Add authentication and role-based access control to better flush out the app. This could lead to patients having a portal they could view their history in.
  - Extend integration coverage and tests to include patients and tests.
  - Refine turnaround time logic to better handle business days and time zones.
  - Introduce an audit trail to capture historical changes so staff can see who updated an order and when.
  - Improve search and filtering for more flexible data exploration.

## Contributing Workflow

1. Run `pnpm lint` and `pnpm typecheck` to catch issues early.
2. Execute `pnpm test` for fast feedback.
3. For changes touching persistence or routing, run `pnpm test:integration` (ensure Postgres is running locally or via Docker).
4. Capture new architectural decisions or trade-offs in `PLAN.md` and keep this README updated for reviewers.
