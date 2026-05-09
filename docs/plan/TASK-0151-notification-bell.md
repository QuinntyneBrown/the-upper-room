---
id: TASK-0151
title: Notification bell + inbox menu
status: Completed
phase: No
depends_on: [TASK-0150, TASK-0005]
traces_to: [L2-062]
estimated_context: small
---

# TASK-0151: Notification bell

## Goal
Bell icon in top bar with badge (unread count, max "99+"); click opens 400px menu (full width on XS) titled "Notifications" with Unread/All tabs; rows show severity-colored icon, title, 2-line preview, relative time. Footer "Mark all as read" + "Notification settings".

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/notifications/notification-bell.spec.ts`

**Page Object:** `components/NotificationBell.ts`.

**Scenarios:**
1. With 0 unread, bell has no badge; opening menu shows empty state ("notifications_off", "You're all caught up").
2. Dispatch a notification → badge increments to 1; menu lists row.
3. Click row → marks read, badge decrements, navigates to deep link.
4. "Mark all as read" → badge to 0; rows still listed under "All" tab.

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
