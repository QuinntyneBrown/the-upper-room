---
id: TASK-0024
title: Forgot / reset password
status: Accepted
phase: A
depends_on: [TASK-0021]
traces_to: [L2-020]
estimated_context: small
---

# TASK-0024: Forgot / reset password

## Goal
Implement `/forgot-password` (email entry) and `/reset-password?token=...` (new password entry) following the anti-enumeration messaging.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/auth/forgot-reset.spec.ts`

**Page Objects:** `pages/ForgotPasswordPage.ts`, `pages/ResetPasswordPage.ts`.

**Scenarios:**
1. **Generic message** — Submitting either a known or unknown email yields the same body "If an account exists for {email}, a reset link has been sent." (no enumeration).
2. **Reset success** — Visit reset-password with valid token, submit a strong password (matching L2-019), redirected to `/sign-in?reset=1`; sign-in succeeds with the new password.
3. **Expired token** — Token > 1h old → "This reset link has expired. Please request a new one." with link back.
4. **Mismatched confirmation** — Confirm Password != New Password → field error "Passwords do not match.".

## Definition of Done
- [ ] No timing oracle (response time within ±50ms for known vs unknown).
