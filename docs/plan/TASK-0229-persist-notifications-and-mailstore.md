---
id: TASK-0229
title: Persist Notifications, preferences, and MailStore in database
status: Done
phase: P
depends_on: []
traces_to: []
estimated_context: medium
---

# TASK-0229: Persist Notifications and MailStore

## Goal

Replace the static `_store` and `_preferences` lists in `TheUpperRoom.Api/Notifications/NotificationsController.cs` (lines 35-36) and the static `Sent` list in `TheUpperRoom.Api/Notifications/MailStore.cs:6` with EF Core persistence (or a real outbound email log/sink for MailStore).

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Implement the radically simplest persistence path.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Notifications/NotificationsPersistenceTests.cs`

**Scenarios:**
1. Notifications and per-user preferences survive a host restart.
2. Sent emails are recorded in the database (or in the configured sink) and survive restart.
3. The `/test/sent-mail` endpoint, if still present at the time this task lands, is deferred for removal in TASK-0231.

### Playwright E2E

- Existing notification preferences e2e spec continues to pass.

## Implementation Outline

- Add `Notification`, `NotificationPreference`, and `SentEmail` entities on `AppDbContext`.
- EF migration.
- Swap controller / mail-store reads/writes to DbContext queries.

## Definition of Done

- [ ] All listed tests pass.
- [ ] No static `_store`, `_preferences`, or `Sent` collections remain in production notifications source.
- [ ] Status updated to `Done`.

## Out of Scope

- Choosing a third-party mail provider — keep using whatever currently sends, just persist the audit log.
