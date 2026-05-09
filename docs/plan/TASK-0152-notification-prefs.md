---
id: TASK-0152
title: Notification preferences page
status: Completed
phase: No
depends_on: [TASK-0150]
traces_to: [L2-064]
estimated_context: small
---

# TASK-0152: Notification preferences

## Goal
`/settings/notifications` table: rows = codes from L2-063, columns = In-app, Email, Push, with `mat-slide-toggle` cells. Auto-save with 1s debounce, "Saved" indicator next to row.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/notifications/notification-prefs.spec.ts`

**Page Object:** `pages/NotificationPreferencesPage.ts`.

**Scenarios:**
1. All 14 codes from L2-063 are listed.
2. Toggle off `event_cancelled` Email → after 1s, PATCH; "Saved" indicator briefly visible.
3. Reload preserves the toggle.
4. Disabled `event_reminder_24h` skips delivery on the next dispatch (verified via TASK-0150 helper).
