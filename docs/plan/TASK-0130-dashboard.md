---
id: TASK-0130
title: Dashboard page
status: Done
phase: H
depends_on: [TASK-0060, TASK-0070, TASK-0100, TASK-0120, TASK-0090]
traces_to: [L2-059]
estimated_context: medium
---

# TASK-0130: Dashboard

## Goal
`/dashboard` with welcome header, 4 stat cards (Contacts, Partners, Upcoming Events, Open Ideas), Upcoming events, Recent activity, My ideas, Tasks on my boards. Responsive grid (XS 2x2 stats; LG+ 12-col layout per L2-059).

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/dashboard/dashboard.spec.ts`

**Page Object:** `pages/DashboardPage.ts`.

**Scenarios:**
1. After sign-in, default landing is `/dashboard` with welcome "Welcome, {firstName}".
2. Stat cards show counts matching seeded data.
3. At XS, stats arrange 2×2; at LG+, 4×1.
4. Upcoming events widget shows next 5; "View calendar" link.
5. "Tasks on my boards" groups assigned cards by board.

## Definition of Done
- [ ] Each widget has its own loading skeleton + error state.

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
