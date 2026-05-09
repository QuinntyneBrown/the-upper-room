---
id: TASK-0181
title: Rate limiting (sign-in, forgot, generic)
status: Accepted
phase: Z
depends_on: [TASK-0021]
traces_to: [L2-094]
estimated_context: small
---

# TASK-0181: Rate limiting

## Goal
Sign-in: 5 / email / 15 min then 30-min lockout. Forgot-password: 3 / email / hour. Generic: 600 RPM / user, 60 RPM / IP unauthenticated. 429 response with `Retry-After`.

## Acceptance Tests

### Backend Integration
- `RateLimitTests.cs` — 6th sign-in attempt yields 429 with `Retry-After: 1800`.
- 4th forgot-password / hour returns 429.

### Playwright E2E
**Spec file:** `frontend/projects/the-upper-room/e2e/tests/hardening/rate-limit.spec.ts`

**Scenarios:**
1. Five wrong-password attempts → snackbar "Too many requests. Wait a moment and try again."; submit button disabled with countdown.
