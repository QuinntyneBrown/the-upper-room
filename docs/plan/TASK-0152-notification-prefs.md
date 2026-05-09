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
