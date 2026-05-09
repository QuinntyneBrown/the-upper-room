---
id: TASK-0173
title: PWA manifest + service worker (shell-only cache)
status: Completed
phase: X
depends_on: [TASK-0001]
traces_to: [L2-117, L2-116]
estimated_context: small
---

# TASK-0173: PWA setup

## Goal
Full `manifest.webmanifest` per L2-116 and a minimal Angular service worker that caches the app shell + immutable assets only — never API responses.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/cross-cutting/pwa.spec.ts`

**Scenarios:**
1. `manifest.webmanifest` returns 200 with name "The Upper Room", short_name "Upper Room", display "standalone", start_url "/dashboard".
2. After first load, the SW activates; reloading offline still shows the shell (white screen avoided), but list pages show offline banner (TASK-0012).
3. API responses are NOT cached (verified by stubbing fetch; second request still hits network).

## Definition of Done
- [ ] Lighthouse PWA score ≥ 90.

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
