---
id: TASK-0025
title: Password policy (12+ chars, HIBP, strength meter)
status: Accepted
phase: A
depends_on: [TASK-0022]
traces_to: [L2-019]
estimated_context: small
---

# TASK-0025: Password policy

## Goal
Enforce client + server validation per L2-019 including a HaveIBeenPwned check (k-anonymity) and a 5-bar strength meter component.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/auth/password-policy.spec.ts`

**Page Object:** `pages/SignUpPage.ts`, `components/PasswordStrengthMeter.ts`.

**Scenarios:**
1. `Password1!` (a known compromised password) is rejected client-side; helper text "Password is too common. Choose a stronger password.".
2. `aaaaaaaaaaaa` (no uppercase/digit/symbol) shows missing-rule indicators in the meter.
3. A 16-char strong password fills all 5 bars and renders text "Strong" in `--md-sys-color-tertiary`.
4. Password equal to user's email local part (`alice` for `alice@example.com`) is rejected with helper "Password may not contain your email or name.".

### Backend Unit
- `PasswordPolicyTests.cs` — every rule from L2-019 has both passing and failing fixtures.
- HIBP service stubbed for unit tests; real HIBP integration tested with one canary value.

## Definition of Done
- [ ] Same rules enforced client + server (parity test).
