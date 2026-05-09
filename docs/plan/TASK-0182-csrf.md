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
