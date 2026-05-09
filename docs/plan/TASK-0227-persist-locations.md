---
id: TASK-0227
title: Persist Locations in database
status: Draft
phase: P
depends_on: []
traces_to: []
estimated_context: small
---

# TASK-0227: Persist Locations in database

## Goal

Replace the static `_store` and `_referencedByFutureEvents` lists in `TheUpperRoom.Api/Locations/LocationsController.cs` (lines 29-30) with EF Core persistence.

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Implement the radically simplest persistence path.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Locations/LocationsPersistenceTests.cs`

**Scenarios:**
1. Locations survive a host restart.
2. Deleting a location referenced by a future event is blocked (existing rule preserved).
3. The "referenced by future events" check now reads from the events table, not a separate static list.

### Playwright E2E

- Existing locations e2e specs continue to pass.

## Implementation Outline

- Add `Location` entity and `DbSet<Location>` on `AppDbContext`.
- EF migration.
- Replace `_referencedByFutureEvents` with a query against the events table.
- Swap controller reads/writes to DbContext queries.

## Definition of Done

- [ ] All listed tests pass.
- [ ] No static `_store` or `_referencedByFutureEvents` remains in `LocationsController.cs`.
- [ ] Status updated to `Done`.

## Out of Scope

- Adding map / geocoding features.
