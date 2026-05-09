---
id: TASK-0230
title: Persist Push subscriptions and load real VAPID key from config
status: Accepted
phase: P
depends_on: []
traces_to: []
estimated_context: medium
---

# TASK-0230: Persist Push subscriptions and load real VAPID key

## Goal

Replace the static `Subscriptions` and `PendingPushes` lists in `TheUpperRoom.Api/Notifications/PushController.cs` (lines 19-20) with EF Core persistence, and load the VAPID public key from configuration instead of returning the literal `"BFakeVapidPublicKey123ForTesting"` (line 24).

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Implement the radically simplest persistence + config-loading path.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Notifications/PushPersistenceTests.cs`

**Scenarios:**
1. Push subscriptions persist across a host restart.
2. Pending pushes persist across a host restart.
3. `GET /api/v1/push/vapid-public-key` returns the value from `PushSettings:VapidPublicKey` configuration.
4. `GET /api/v1/push/vapid-public-key` does NOT return the literal string `"BFakeVapidPublicKey123ForTesting"`.
5. Production startup fails fast if `PushSettings:VapidPublicKey` is missing.

### Playwright E2E

- Existing push-channel e2e spec continues to pass.

## Implementation Outline

- Add `PushSubscription` and `PendingPush` entities on `AppDbContext`.
- EF migration.
- Swap controller reads/writes to DbContext queries.
- Read `PushSettings:VapidPublicKey` (and `:VapidPrivateKey` if needed) from `IConfiguration`.
- Add startup guard for required keys in `Production`.

## Definition of Done

- [ ] All listed tests pass.
- [ ] `grep -rn "BFakeVapidPublicKey123ForTesting" backend/src` returns no matches.
- [ ] No static `Subscriptions` or `PendingPushes` remain in `PushController.cs`.
- [ ] Status updated to `Done`.

## Out of Scope

- Implementing the actual web-push send pipeline (separate concern; this task targets persistence + config).
