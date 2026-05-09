---
id: TASK-0172
title: Optimistic UI patterns generalized
status: Completed
phase: X
depends_on: [TASK-0008, TASK-0092, TASK-0100]
traces_to: [L2-114]
estimated_context: small
---

# TASK-0172: Optimistic UI

## Goal
Generalize an `optimisticMutation()` helper that wraps any toggle action (vote, RSVP, archive, kanban move). On 5xx the helper reverts the local state and shows snackbar "Couldn't save. Try again.".

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/cross-cutting/optimistic-ui.spec.ts`

**Scenarios:**
1. Vote on idea: API stub 500 → heart reverts to unfilled within 500ms; snackbar visible.
2. RSVP: API 500 → segmented selection reverts; snackbar visible.
3. Kanban move: API 500 → card returns to source column.

## Definition of Done
- [ ] Helper exposed in `components` library.

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
