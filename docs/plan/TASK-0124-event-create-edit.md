---
id: TASK-0124
title: Event create / edit form
status: Done
phase: E
depends_on: [TASK-0120, TASK-0070, TASK-0110]
traces_to: [L2-056]
estimated_context: medium
---

# TASK-0124: Event create / edit

## Goal
Sectioned form: Basics, When (start, end, timezone, all-day, recurrence — None for now), Where (Location autocomplete OR Virtual URL OR both, "TBD" toggle), Who (Capacity, Requires approval, Partners), Tags. Live preview card on MD+.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/events/event-create-edit.spec.ts`

**Page Object:** `pages/EventFormPage.ts`.

**Scenarios:**
1. End < start → field-level error "End time must be after start time."; submit blocked.
2. Pick location from autocomplete → preview card updates with location name.
3. Switch timezone → preview times reflect new TZ but UTC stored value unchanged.
4. Save and reload → values round-trip correctly.

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
