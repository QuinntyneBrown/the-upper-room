---
id: TASK-0020
title: Sign-in page (UI + mock auth provider)
status: Completed
phase: A
depends_on: [TASK-0005, TASK-0007, TASK-0008]
traces_to: [L2-016]
estimated_context: medium
---

# TASK-0020: Sign-in page

## Goal
Implement the sign-in page UI exactly per L2-016 with a mock auth provider that accepts a hard-coded test credential and returns a fake access token. PKCE/BFF wiring follows in TASK-0021.

## ATDD Process — REQUIRED

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/auth/sign-in.spec.ts`

**Page Object:** `pages/SignInPage.ts` (`goto()`, `emailInput()`, `passwordInput()`, `submitButton()`, `togglePasswordVisibility()`, `forgotPasswordLink()`, `signUpLink()`, `errorFor(field)`, `submit()`).

**Scenarios:**
1. **Valid credentials** — Given `test@example.com` / `Password!23456`, when submit, then redirect to `/dashboard` and a snackbar is NOT shown.
2. **Empty email** — Submit with empty email; error "Email is required" shown; focus moves to email; no network call.
3. **Wrong credentials** — Bad password; field-level error "The email or password is incorrect." appears (matches L2-066 `auth.invalid_credentials`).
4. **Password visibility toggle** — Type password, click eye icon; input type becomes `text`; click again becomes `password`.
5. **Layout XS** — At 375px the card is full-width minus 16px padding.
6. **Layout MD** — At 1024px the card is `max-width: 400px`, centered.

## Implementation Outline
- `projects/domain/src/lib/auth/sign-in/` (3 files).
- Mock provider behind `AUTH_PROVIDER` token; real PKCE provider replaces it in TASK-0021.

## Definition of Done
- [ ] All scenarios pass.
- [ ] No literal copy in template (i18n keys only).
- [ ] Lint clean including `contract-token-import`.
