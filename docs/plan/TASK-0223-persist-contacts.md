---
id: TASK-0223
title: Persist Contacts in database (replace static in-memory store)
status: Accepted
phase: P
depends_on: []
traces_to: []
estimated_context: medium
---

# TASK-0223: Persist Contacts in database

## Goal

Replace the static in-memory `_store` used by `TheUpperRoom.Api/Contacts/ContactsController.cs` with EF Core persistence backed by the application's database. Today contacts disappear on every process restart.

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Implement the radically simplest persistence path.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Contacts/ContactsPersistenceTests.cs`

**Scenarios:**
1. Creating a contact via `POST /api/v1/contacts` and then resolving the test server scope returns the contact from the database.
2. Restarting the test host (new factory instance pointing at the same database) returns previously-created contacts via `GET /api/v1/contacts`.
3. City scoping: a contact created under city A is not returned for a request scoped to city B.
4. Archive and delete behaviors persist across restart.

### Playwright E2E

- The existing contacts e2e specs continue to pass against the persisted backend.

## Implementation Outline

- Add `Contact` entity and `DbSet<Contact> Contacts` on the existing `AppDbContext` (or introduce one if missing — keep migration scope minimal).
- Add EF migration. Apply on startup in non-Production via `dbContext.Database.Migrate()`; in Production gate behind explicit flag.
- Replace `_store` reads/writes in `ContactsController.cs` with `AppDbContext` queries.
- Delete the static `_store` field.

## Definition of Done

- [ ] All listed tests pass against a real (sqlite in-memory or testcontainers) database.
- [ ] `grep -n "_store" backend/src/TheUpperRoom.Api/Contacts/ContactsController.cs` returns no matches.
- [ ] `dotnet build`, `dotnet test`, and existing Playwright contacts specs all green.
- [ ] Status updated to `Done`.

## Out of Scope

- Cross-entity persistence migrations (covered by sibling tasks 0224-0230).
- Soft-delete / audit-log redesign beyond what already exists.
