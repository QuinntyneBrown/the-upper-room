---
id: TASK-0140
title: Global search dialog + cross-resource backend endpoint
status: Done
phase: S
depends_on: [TASK-0060, TASK-0070, TASK-0100, TASK-0110, TASK-0120]
traces_to: [L2-060, L2-077]
estimated_context: medium
---

# TASK-0140: Global search

## Goal
`Ctrl+K` / `Cmd+K` and the search icon open a centered dialog (`min(640px, 100vw - 32px)`, top-positioned `15vh`). Backend `GET /api/v1/search?q=` searches across Contacts, Partners, Events, Ideas, Locations and returns up to 5 per group.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/search/global-search.spec.ts`

**Page Object:** `components/GlobalSearchDialog.ts`.

**Scenarios:**
1. Press `Control+K` → dialog opens within 200ms; input is autofocused.
2. Type "alice" → after 300ms exactly one network call; results grouped.
3. ArrowDown 3 times + Enter → navigates to the third result.
4. No results → empty state with `search_off`, "No matches", "Try different keywords or check your filters.".
5. Esc closes dialog and returns focus to the trigger.

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
