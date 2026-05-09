---
id: TASK-0185
title: Bundle budgets + Lighthouse-CI
status: Completed
phase: Z
depends_on: [TASK-0001]
traces_to: [L2-089, L2-090]
estimated_context: small
---

# TASK-0185: Bundle budgets + LH-CI

## Goal
Configure `angular.json` budgets per L2-090. CI runs Lighthouse-CI on the routes listed in L2-089 and fails when any vital regresses >10% from a 7-day rolling baseline.

## Acceptance Tests

### CI
- `lhci autorun` runs with assertions: LCP ≤ 2500, INP ≤ 200, CLS ≤ 0.1, TBT ≤ 300.
- A PR that introduces a 1MB synchronous JS chunk fails CI with "LCP regressed by ≥ 10%".

### Playwright (regression net)
**Spec file:** `frontend/projects/the-upper-room/e2e/tests/hardening/perf-budgets.spec.ts`

**Scenario:**
1. Read `angular.json` config; assert initial-bundle warning ≤ 400kB and error ≤ 600kB.

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
