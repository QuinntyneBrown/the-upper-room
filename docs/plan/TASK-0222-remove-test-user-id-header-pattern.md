---
id: TASK-0222
title: Remove X-Test-User-Id header reads from all controllers
status: Done
phase: P
depends_on: [TASK-0221]
traces_to: []
estimated_context: medium
---

# TASK-0222: Remove X-Test-User-Id header reads

## Goal

Delete every `X-Test-User-Id` header read from production controllers (audit reports ~17 controllers, including `UsersController.cs:13` and `ContactsController.cs:157`). Replace each `GetCurrentUser()` helper with a call to the `ICurrentUser` service introduced by TASK-0221. The header was a development shortcut and is a critical authentication-bypass vector.

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Replace header reads with `ICurrentUser` calls.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Auth/TestUserHeaderRemovedTests.cs`

**Scenarios:**
1. A request to any of the previously-affected endpoints carrying `X-Test-User-Id: <id>` and NO valid bearer token receives `401` (header is no longer honored).
2. A request to those endpoints with a valid bearer token resolves the same user the controller acts on (verify by hitting an endpoint that returns `currentUser.Id`).
3. Source-level guard: a build-time check (test that scans source files) asserts the literal string `"X-Test-User-Id"` does not appear under `backend/src/`.

### Existing controller-level integration tests

- All previously passing tests continue to pass after being updated to send a real bearer token instead of the test header.

## Implementation Outline

- Audit `backend/src` for every `X-Test-User-Id` reference: `grep -rn "X-Test-User-Id" backend/src`.
- For each controller, replace the header read in the local `GetCurrentUser()` helper with `ICurrentUser.UserId` (or remove the helper outright in favor of the service).
- Update test setup (`backend/tests/.../TestServer` factory) to issue real bearer tokens instead of stamping headers.

## Definition of Done

- [ ] All listed tests pass.
- [ ] `grep -rn "X-Test-User-Id" backend/src` returns no matches.
- [ ] `dotnet build` and `dotnet test` green for the full solution.
- [ ] Status updated to `Done`.

## Out of Scope

- Adding new role/permission checks (separate work).
- Migrating tests in unrelated areas that already pass.
