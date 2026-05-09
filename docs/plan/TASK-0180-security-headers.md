---
id: TASK-0180
title: Security headers + HSTS + CSP
status: Completed
phase: Z
depends_on: [TASK-0001]
traces_to: [L2-092]
estimated_context: small
---

# TASK-0180: Security headers

## Goal
Backend middleware applies `HSTS`, `CSP`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` per L2-092. HTTP requests redirect to HTTPS.

## Acceptance Tests

### Backend Integration
- `SecurityHeadersTests.cs` — every header present with the exact values from L2-092.
- HTTP request to API returns 308 redirect to HTTPS.

### Playwright E2E
**Spec file:** `frontend/projects/the-upper-room/e2e/tests/hardening/security-headers.spec.ts`

**Scenarios:**
1. `GET /` response headers contain `Strict-Transport-Security`, `Content-Security-Policy`, etc.
2. CSP blocks an injected `<script src="https://evil.example/">` (verified via report endpoint).

## Definition of Done
- [ ] Mozilla Observatory grade A or higher.

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
