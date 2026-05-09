---
id: TASK-0182
title: CSRF protection (anti-forgery double-submit)
status: Completed
phase: Z
depends_on: [TASK-0021]
traces_to: [L2-096]
estimated_context: small
---

# TASK-0182: CSRF

## Goal
Cookie-based endpoints require an anti-forgery token (double-submit). Bearer-only endpoints exempt. Frontend interceptor sets `X-XSRF-TOKEN` from cookie.

## Acceptance Tests

### Backend Integration
- `CsrfTests.cs` — POST without `X-XSRF-TOKEN` returns 403 with `code: "csrf.invalid"`.

### Playwright E2E
**Spec file:** `frontend/projects/the-upper-room/e2e/tests/hardening/csrf.spec.ts`

**Scenarios:**
1. Sign out (cookie auth) succeeds with token.
2. Manually deleting the XSRF cookie causes the next sign-out POST to 403; UI shows "Your action could not be verified. Refresh the page and try again.".

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
