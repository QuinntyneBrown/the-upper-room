---
id: TASK-0023
title: Email verification flow
status: Accepted
phase: A
depends_on: [TASK-0022]
traces_to: [L2-018]
estimated_context: small
---

# TASK-0023: Email verification

## Goal
Implement `/verify-email` (waiting state) and `/verify-email/confirm?token=...` (token-handling) per L2-018, including resend rate limiting and expired-token state.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/auth/verify-email.spec.ts`

**Page Object:** `pages/VerifyEmailPage.ts`.

**Scenarios:**
1. **Verified** — Visiting `/verify-email/confirm?token=valid` flips to "Email verified" with `check_circle` icon and a "Go to dashboard" filled button.
2. **Expired** — `token=expired` shows "Link expired", body about 24h, "Send a new link" button.
3. **Resend rate limit** — Clicking "Resend email" twice within 60s shows "Please wait Ns before requesting another email" and disables the button with countdown.

## Implementation Outline
- Backend `POST /api/v1/auth/verify-email` consumes single-use token (24h TTL).
- Resend rate-limit per email: 1 every 60s; per email/24h cap of 5.

## Definition of Done
- [ ] Token reuse rejected with HTTP 410 Gone.
