---
id: TASK-0233
title: Remove or gate X-All-Cities header bypass
status: Done
phase: P
depends_on: [TASK-0221]
traces_to: []
estimated_context: small
---

# TASK-0233: Remove X-All-Cities header bypass

## Goal

Remove the `X-All-Cities` header read in `TheUpperRoom.Api/Contacts/ContactsController.cs:75` which currently lets a `SystemAdmin` bypass city isolation via a custom header. Replace with a properly authorized query parameter (e.g. `?scope=all`) gated by a real role/permission check from the auth middleware introduced in TASK-0221.

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Make them green with the radically simplest replacement.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Contacts/AllCitiesAccessTests.cs`

**Scenarios:**
1. `GET /api/v1/contacts` with `X-All-Cities: true` returns city-scoped results (header is ignored).
2. `GET /api/v1/contacts?scope=all` as a non-SystemAdmin returns 403.
3. `GET /api/v1/contacts?scope=all` as a SystemAdmin returns contacts across all cities.
4. Source-level guard: `grep` for `X-All-Cities` in `backend/src` returns no matches.

## Implementation Outline

- Remove the header read.
- Add a `scope=all` query parameter handler that calls `_authorization.AuthorizeAsync(user, "SystemAdmin")` (or equivalent role check from middleware established in TASK-0221).
- Update existing tests that relied on the header.

## Definition of Done

- [ ] All listed tests pass.
- [ ] `grep -rn "X-All-Cities" backend/src` returns no matches.
- [ ] Status updated to `Done`.

## Out of Scope

- Designing a full multi-tenant scope-selection UI.
