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

## UI Component Requirements (MANDATORY — Angular Material)

If this task introduces or modifies any user-facing UI element, **all UI components MUST use Angular Material primitives**. Raw HTML form controls and custom-styled overlays are forbidden.

- **Source of components:** import from the shared `'components'` library first (`TarButton`, `TarFab`, `TarIconButton`, `TarTextField`, `TarTextarea`, `TarSelect`, `TarList`, `TarCard`, `ConfirmService`, `SnackbarService`). Fall back to `@angular/material` modules directly (`MatDialog`, `MatFormField` + `matInput`, `MatSelect`, `MatButton`, `MatList`, `MatCard`, `MatChipGrid`, `MatDatepicker`, etc.).
- **Forbidden:** raw `<button>`, `<input>`, `<select>`, `<textarea>`, hand-rolled overlay/modal `<div>`s, custom CSS-styled form controls, ad-hoc dropdown menus.
- **Buttons:** `TarButton` / `TarFab` / `TarIconButton` or `mat-button` / `mat-icon-button` / `mat-fab` — never raw `<button>` styled with custom CSS.
- **Form fields:** `TarTextField` / `TarTextarea` / `TarSelect` or `mat-form-field` + `matInput` / `mat-select` — never raw `<input>` / `<select>` / `<textarea>`.
- **Dialogs & overlays:** `MatDialog` service with a dialog component — never hand-rolled overlay `<div>` with backdrop CSS.
- **Confirmations:** `ConfirmService` from `'components'` — never `window.confirm` or custom dialogs.
- **Snackbar/toasts:** `SnackbarService` from `'components'` — never custom toast components.
- **Lists:** `mat-list` / `TarList` — never `<ul>` styled as a list control.
- **Cards/surfaces:** `mat-card` / `TarCard` — never raw `<div>` with elevation CSS.
- **Chips/tags:** `mat-chip-grid` / `mat-chip-row` — never custom chip elements.

This requirement is **enforced at code review**. Any PR introducing raw HTML form controls, custom overlay divs, or `window.confirm` for this task will be rejected. If a needed primitive is missing from `'components'`, add it to that library rather than inlining a custom one.
