---
id: TASK-0234
title: Remove hardcoded SeedUsers and seeded "e-seed" event
status: Draft
phase: P
depends_on: [TASK-0221, TASK-0224]
traces_to: []
estimated_context: small
---

# TASK-0234: Remove hardcoded SeedUsers and seeded events

## Goal

Remove the hardcoded demo users in `TheUpperRoom.Api/Rbac/SeedUsers.cs` (lines 8-11: `admin`, `lead`, `member`, `guest` with example.com emails) and any remaining seeded "e-seed" / "City Prayer Night" event reference. Demo identities must not exist in production runs.

Depends on TASK-0221 (real auth middleware) so users actually authenticate via JWT rather than via the SeedUsers dictionary lookup. Depends on TASK-0224 because that task already covers removing the hardcoded event from the events store; this task simply verifies no other reference re-seeds it.

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Make them green with the radically simplest deletion.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Cleanup/SeedDataRemovedTests.cs`

**Scenarios:**
1. The `SeedUsers` class does not exist in `backend/src` (or is empty).
2. Starting the host in any environment does NOT create users with email domain `example.com`.
3. Starting the host in any environment does NOT create an event named "City Prayer Night" with id `e-seed`.

### Existing tests

- Test setup that previously relied on `SeedUsers` is updated to insert any required test users via the EF context directly in the test factory.

## Implementation Outline

- Delete `Rbac/SeedUsers.cs` (or empty its dictionary).
- Remove all production references to `SeedUsers` and `e-seed`.
- Move any required seeding for tests into the test factory.

## Definition of Done

- [ ] All listed tests pass.
- [ ] `grep -rn "SeedUsers\|e-seed\|City Prayer Night\|@example.com" backend/src` returns no matches.
- [ ] Status updated to `Done`.

## Out of Scope

- Building an admin "first user" provisioning flow (separate task if needed).
