# Lab Orders Lite Development Plan

## Repository Audit Summary

✅ **Already Implemented:**

- Prisma schema with correct domain model (Patient, Test, Order, OrderItem)
- Database seeding with demo data
- Zod validation schemas for Patient, Test, Order
- API routes foundation (GET/POST for patients, tests, orders)
- Basic calculations library (calcTotal, calcEta)
- TanStack Query provider setup
- Frontend pages structure (patients, tests, orders)
- UI components with shadcn/ui
- README with setup instructions

⚠️ **Needs Completion/Fixes:**

- Missing package.json scripts (prisma:\*)
- Missing .env.example file
- Incomplete API routes (missing PATCH endpoints, tests/[id], orders/[id])
- Missing HTTP error helper for 400 responses
- Frontend pages not wired with TanStack Query hooks
- Missing formatMoney utility
- Domain model discrepancies (Patient.name vs fullName, Test vs LabTest)

---

## Development Tasks

### Phase 1: Data Layer Completion

- [ ] Update package.json with missing Prisma scripts
- [ ] Create .env.example file
- [ ] Fix Prisma schema discrepancies:
  - [ ] Rename `Patient.name` → `Patient.fullName`
  - [ ] Rename `Test` → `LabTest` model
  - [ ] Update model references (`Test` → `LabTest`)
- [ ] Run migration and regeneration
- [ ] Verify seed data works correctly

**Commands:**

```bash
# Add prisma scripts to package.json
pnpm prisma generate
pnpm prisma migrate dev --name fix-domain-models
pnpm prisma db seed
```

### Phase 2: Validation & HTTP Helpers

- [ ] Update validation schemas to match domain model fixes
- [ ] Create `lib/http.ts` helper for consistent 400 error responses
- [ ] Add `formatMoney` utility function

### Phase 3: API Routes Completion ✅ COMPLETE

- [x] Complete `app/api/tests/[id]/route.ts` (PATCH endpoint)
- [x] Complete `app/api/orders/[id]/route.ts` (GET/PATCH endpoints)
- [x] Add status transition validation logic
- [x] Test all endpoints with cURL samples
- [x] Create `lib/http.ts` helper for consistent 400 error responses
- [x] Add `formatMoney` utility function

**Test Commands (Verified Working):**

```bash
# Test patients endpoint
curl -X GET "http://localhost:3000/api/patients?search=Sarah" | jq

# Test tests endpoint
curl -X GET "http://localhost:3000/api/tests?activeOnly=1" | jq

# Test order creation
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patID",
    "items": [
      {
        "labTestId": "test1ID",
        "unitPriceCents": 4500,
        "turnaroundDaysAtOrder": 2
      }
    ]
  }' | jq

# Test order status update
curl -X PATCH "http://localhost:3000/api/orders/ORDER_ID" \
  -H "Content-Type: application/json" \
  -d '{"status": "SUBMITTED"}' | jq

# Test lab test update
curl -X PATCH "http://localhost:3000/api/tests/LABTEST_ID" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}' | jq

# Test get single order
curl -X GET "http://localhost:3000/api/orders/ORDER_ID" | jq
```

### Phase 4: TanStack Query Client Hooks ✅ COMPLETE

- [x] Create `hooks/use-patients.ts` with search and create mutations
- [x] Create `hooks/use-tests.ts` with active filter and CRUD operations
- [x] Create `hooks/use-orders.ts` with filtering and lists
- [x] Create `hooks/use-order.ts` for single order management
- [x] Add optimistic updates for order status changes with rollback
- [x] Implement proper error handling and loading states
- [x] Query key factories for optimal caching strategy
- [x] Pre-population of order detail cache

### Phase 5: Frontend Pages Integration ✅ COMPLETE

- [x] Wire `/app/patients/page.tsx` with use-patients hook
- [x] Wire `/app/tests/page.tsx` with use-tests hook
- [x] Wire `/app/orders/page.tsx` with use-orders hook
- [x] Wire `/app/orders/new/page.tsx` with live preview (Total/ETA)
- [x] Wire `/app/orders/[id]/page.tsx` with status transitions
- [x] Add filtering/search functionality to all list pages
- [x] Implement guarded status transition buttons
- [x] Updated all components to use custom hooks with proper field names
- [x] Added formatMoney utility throughout for consistent currency display
- [x] Implemented optimistic updates for status changes

### Phase 6: Testing & Documentation ✅ COMPLETE (Unit Tests)

- [x] Set up Vitest configuration with React support
- [x] Add unit tests for `lib/calculations.ts` (15 tests)
- [x] Add unit tests for `lib/http.ts` (5 tests)
- [x] Add unit tests for Zod validation schemas (36 tests):
  - [x] Patient validation (13 tests)
  - [x] LabTest validation (15 tests)
  - [x] Order validation (6 tests)
- [x] Fixed calcEta edge case for empty arrays
- [x] All 56 tests passing ✅

**Remaining Documentation Tasks:**

- [ ] Add integration test for order creation snapshots
- [ ] Update README.md with:
  - [ ] Architecture overview
  - [ ] API documentation
  - [ ] Known limitations
  - [ ] Future improvements roadmap

---

## Development Workflow

### Before Each Phase:

1. Review current status
2. Create feature branch if multiple phases
3. Run linting: `pnpm lint`
4. Ensure database is seeded: `pnpm prisma db seed`

### During Development:

- Commit small, focused changes
- Test API endpoints manually
- Verify frontend integration works

### After Each Phase:

- Test the complete flow (create patient → create order → view order)
- Update this PLAN.md with completion status
- Run full test suite (when available)
- Document any breaking changes

---

## Domain Model Mapping

### Current vs Target:

| Current Schema     | Target Domain         | Status                 |
| ------------------ | --------------------- | ---------------------- |
| `Patient.name`     | `Patient.fullName`    | ❌ Need to rename      |
| `Test` model       | `LabTest` model       | ❌ Need to rename      |
| `OrderItem.testId` | `OrderItem.labTestId` | ❌ Need to rename      |
| Status transitions | Proper validation     | ❌ Need implementation |

### Business Rules Implementation:

- [x] `totalCents = sum(OrderItem.unitPriceCents)`
- [x] `estimatedReadyAt = placedAt + max(turnaroundDays)`
- [ ] Status transition validation: `DRAFT → SUBMITTED → IN_PROGRESS → READY`
- [ ] Cancellation: `DRAFT/SUBMITTED → CANCELLED`

---

## File Structure Status

```
lib/
├── calculations.ts ✅ Done
├── prisma.ts ✅ Done
├── http.ts ❌ Missing
├── validation/
│   ├── patient.ts ✅ Done (needs updates)
│   ├── test.ts ✅ Done (needs updates)
│   └── order.ts ✅ Done
└── query-client.tsx ✅ Done

app/api/
├── patients/route.ts ✅ Done
├── tests/
│   ├── route.ts ✅ Done
│   └── [id]/route.ts ❌ Missing PATCH
└── orders/
    ├── route.ts ✅ Done
    └── [id]/route.ts ❌ Missing GET/PATCH

hooks/
└── (all missing) ❌ Need to create

.env.example ❌ Missing
```

---

## Next Steps Priority

1. **IMMEDIATE**: Fix domain model discrepancies and run migration
2. **API**: Complete missing endpoints with proper validation
3. **Frontend**: Wire pages with TanStack Query hooks
4. **Polish**: Add tests and documentation

---

_This plan will be updated after each phase completion._
