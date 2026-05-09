---
id: TASK-0150
title: Notification data model + API + dispatch service
status: Completed
phase: No
depends_on: [TASK-0033]
traces_to: [L2-062, L2-063]
estimated_context: medium
---

# TASK-0150: Notifications backend

## Goal
Persist `Notifications`, `NotificationPreferences`. Implement `INotificationDispatcher` that enqueues notifications by code (per L2-063 catalog) and fans out to channels honoring per-user preferences.

## Acceptance Tests

### Backend Integration

**File:** `TheUpperRoom.Application.Tests/NotificationsTests.cs`

**Scenarios:**
1. Dispatch `event_reminder_24h` → row in `Notifications` for each RSVP'd user with rendered title/body.
2. User with `event_reminder_24h.InApp=false` does NOT receive the row.
3. Each notification has `code`, `data` (JSON for templating), `read=false`, `createdAt`.

### Playwright E2E (sanity)
**Spec file:** `frontend/projects/the-upper-room/e2e/tests/notifications/notifications-api.spec.ts`

Test page calls dispatch helper and verifies via `GET /api/v1/notifications`.
