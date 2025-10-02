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
