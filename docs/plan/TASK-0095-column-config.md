---
id: TASK-0095
title: Column configuration (rename / reorder / color)
status: Completed
phase: K
depends_on: [TASK-0090]
traces_to: [L2-047]
estimated_context: small
---

# TASK-0095: Column config

## Goal
`/boards/:id/configure` lets CityLead+ edit columns: rename, reorder via drag handle, change color (12 M3 chip colors), set/remove WIP limit, add/remove columns. Removing a column with cards prompts a "Move N cards to..." selector.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/kanban/column-config.spec.ts`

**Page Object:** `pages/BoardConfigurePage.ts`.

**Scenarios:**
1. Reorder columns via drag → persists; board view reflects the new order.
2. Remove column with cards → "Move N cards to..." dialog shown; on confirm, cards moved to selected column.
3. Member without `KanbanBoard:Configure` is redirected to `/forbidden`.

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
