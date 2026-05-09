---
id: TASK-0202
title: Extract NotificationBell and NotificationPreferences to domain library
status: Done
phase: X
depends_on: [TASK-0151, TASK-0152]
traces_to: []
estimated_context: small
---

# TASK-0202: Extract NotificationBell and NotificationPreferences to domain library

## Goal

Move `notification-bell/` and `notification-preferences/` from `src/app/notifications/` into the `domain` library. `NotificationBell` is embedded in `AppShell` and both components consume the notifications API — making them cross-cutting domain components that should live outside any single feature folder.

## ATDD Process — REQUIRED

This task **MUST** be implemented using ATDD:

1. Create the failing tests listed below first (Playwright e2e + unit/integration where applicable).
2. Run them. Confirm each fails with a meaningful failure message — not a build/import error.
3. Write the **radically simplest** production code to flip them green. No premature abstraction.
4. Refactor only with all tests green. Never modify production code without a failing test demanding the change.
5. Do not extend scope. If a real edge case appears that isn't in this task, file a follow-up task.

## Acceptance Tests

### Playwright E2E (Page Object Model)

**Spec file(s):**
- `frontend/projects/the-upper-room/e2e/tests/notifications/notification-bell-via-library.spec.ts`

**Page Objects required (create or extend):**
- `components/NotificationBell.ts` — existing POM; verify it still works after the move.

**Scenarios:**
1. **Notification bell renders in shell** — Given the user is signed in, when the app shell loads, then the notification bell icon is visible in the toolbar (no regression after move).
2. **Unread badge count shows** — Given there are unread notifications, then the bell displays the correct unread count badge.
3. **Notification preferences page still renders** — Given the user navigates to notification preferences, then the preference toggles render and save correctly.

### Unit / Integration

- Frontend: `domain/src/lib/notifications/notification-bell.spec.ts` — covering unread count capping at `99+` and mark-all-read behaviour.

## Implementation Outline

- **Move:** `src/app/notifications/notification-bell/` → `domain/src/lib/notifications/notification-bell/`
- **Move:** `src/app/notifications/notification-preferences/` → `domain/src/lib/notifications/notification-preferences/`
- **Rename selectors:** `app-notification-bell` → `tar-notification-bell`, `app-notification-preferences` → `tar-notification-preferences`. Update all usages.
- **Export:** Add `TarNotificationBell`, `TarNotificationPreferences` to `domain/public-api.ts`. Register in `provideDomain()`.
- **App:** Update `AppShell` template to use `tar-notification-bell`. Update the notification preferences route to import from `domain`. Remove `src/app/notifications/notification-bell/` and `src/app/notifications/notification-preferences/` folders.

## Definition of Done

- [ ] All listed e2e scenarios pass on CI in headless Chromium and WebKit.
- [ ] All listed unit/integration tests pass.
- [ ] Coverage gates (L2-101) still green.
- [ ] `npm run lint`, `npm run typecheck`, `dotnet build`, `dotnet test` all green.
- [ ] Every test file added has a `// Traces to: L2-XXX` header.
- [ ] No literal user-facing strings in templates (i18n lint clean).
- [ ] No `px` margin/padding values outside the spacing token mixin (L2-003).
- [ ] No new components in single-file form (L2-081).
- [ ] BEM compliance verified by stylelint (L2-082).
- [ ] `TarNotificationBell` and `TarNotificationPreferences` exported from `domain/public-api.ts`.
- [ ] `src/app/notifications/notification-bell/` and `notification-preferences/` deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Moving the notification data model or API dispatch service.
- Adding real-time WebSocket notification updates (separate task).
