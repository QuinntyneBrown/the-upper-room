---
id: TASK-0231
title: Remove TestLogsController and /test/* endpoints
status: Accepted
phase: P
depends_on: [TASK-0229, TASK-0230, TASK-0232]
traces_to: []
estimated_context: small
---

# TASK-0231: Remove TestLogsController and /test/* endpoints

## Goal

Delete production test endpoints that exist purely for ad-hoc inspection:

- `TheUpperRoom.Api/Logging/TestLogsController.cs` — exposes captured logs at `/api/v1/test`.
- `TheUpperRoom.Api/Notifications/NotificationsController.cs:125` — `[HttpGet("test/sent-mail")]`.
- `TheUpperRoom.Api/Notifications/PushController.cs:53` — `[HttpGet("test/pending")]`.

Depends on TASK-0229 / TASK-0230 / TASK-0232 because those persistence migrations may currently rely on these endpoints to verify state — once they have proper integration tests, the endpoints have no remaining consumers.

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Make them green by deleting the endpoints.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Cleanup/TestEndpointsRemovedTests.cs`

**Scenarios:**
1. `GET /api/v1/test` returns 404.
2. `GET /api/v1/notifications/test/sent-mail` returns 404.
3. `GET /api/v1/push/test/pending` returns 404.
4. Source-level guard: a test that scans `backend/src` asserts no `[HttpGet("test/...")]` or `Route("api/v1/test")` remains.

### Existing tests

- All other tests continue to pass after migration off these endpoints (inspect via dependency-injected stores instead).

## Implementation Outline

- Delete `TestLogsController.cs`.
- Delete the two `test/...` action methods.
- Update any test harness that hit these endpoints to instead query the persisted store directly via the test factory's DI scope.

## Definition of Done

- [ ] All listed tests pass.
- [ ] `grep -rn "api/v1/test\|test/sent-mail\|test/pending" backend/src` returns no matches.
- [ ] Status updated to `Done`.

## Out of Scope

- Building admin/debug UIs to replace these endpoints.
