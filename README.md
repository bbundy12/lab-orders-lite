# Lab Orders Lite

A minimal clinic lab order management system built with Next.js, Prisma, and TanStack Query.

## Features

- **Patient Management**: Add and track patient information
- **Lab Test Catalog**: Manage available tests with pricing and turnaround times
- **Order System**: Create orders with multiple tests, automatic cost calculation, and ETA estimation
- **Status Workflow**: Track orders through DRAFT → SUBMITTED → IN_PROGRESS → READY states

## Tech Stack

- **Next.js 14+** with App Router and TypeScript
- **Prisma ORM** with PostgreSQL
- **Zod** for input validation
- **TanStack Query** for client-side data management
- **Tailwind CSS** with shadcn/ui components

## Setup

1. Clone the repository and install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

2. Set up your database:
   \`\`\`bash
   cp .env.example .env

# Edit .env with your PostgreSQL connection string

\`\`\`

3. Run database migrations and seed:
   \`\`\`bash
   pnpm prisma migrate dev
   pnpm prisma db seed
   \`\`\`

4. Start the development server:
   \`\`\`bash
   pnpm dev
   \`\`\`

Visit http://localhost:3000 to see the application.

## Architecture

### Database Schema

- **Patient**: Basic patient information (name, DOB, contact)
- **Test**: Lab test catalog with code, name, price, and turnaround days
- **Order**: Patient orders with status tracking
- **OrderItem**: Individual tests within an order (snapshots price and turnaround at order time)

### Business Rules

- Order total = sum of all item prices
- Order ETA = placed date + max turnaround days of all tests
- Status transitions: DRAFT → SUBMITTED → IN_PROGRESS → READY (or CANCELLED from DRAFT/SUBMITTED)
- Prices and turnaround days are snapshotted when order is created

### Design Philosophy

Inspired by the Aleef pet app aesthetic:

- Rounded corners (24px radius)
- Soft shadows and light backgrounds
- Generous whitespace and padding
- Clean, minimal, professional appearance

## Known Limitations

- No authentication or authorization
- ETA calculation doesn't account for weekends/holidays
- Basic search and filtering only
- No order history or audit trail

## Future Improvements

- Add role-based access control
- Implement business-day ETA calculation
- Export orders as CSV/PDF
- Add order history and status change tracking
- Email notifications for order status changes

## Integration Testing

### Local Workflow

1. Copy the integration env template and adjust credentials if needed:

   ```bash
   cp test.integration.env .env.test
   # update DATABASE_URL/SHADOW_DATABASE_URL if you are not using Docker defaults
   ```

2. Start the Postgres test container:

   ```bash
   docker compose -f docker-compose.test.yml up -d postgres
   ```

3. Run the integration suite:

   ```bash
   pnpm test:integration
   ```

   Behind the scenes this will:

   - Reset the database with `prisma migrate reset --force --skip-generate`
   - Reseed via `prisma/seed.ts`
   - Spin up a Next.js test server in dev mode and execute Supertest scenarios against the real route handlers

4. Tear down containers when finished:
   ```bash
   docker compose -f docker-compose.test.yml down
   ```

### CI Recommendation

Add a dedicated job that mirrors the above workflow. Example (GitHub Actions):

```yaml
jobs:
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: lab
          POSTGRES_PASSWORD: lab
          POSTGRES_DB: laborderslite
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U lab -d laborderslite"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - run: pnpm install --frozen-lockfile
      - run: cp test.integration.env .env.test
      - run: pnpm test:integration
```

Key point: keep integration tests in their own job to avoid slowing down the main unit-test path and to ensure Docker + Postgres are provisioned before Vitest runs.
