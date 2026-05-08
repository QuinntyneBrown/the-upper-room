---
id: TASK-0045
title: Active sessions / revoke other devices
status: Completed
phase: U
depends_on: [TASK-0043, TASK-0026]
traces_to: [L2-107]
estimated_context: small
---

# TASK-0045: Active sessions

## Goal
On `/profile` Security section, list active sessions with device, IP-derived location, last seen; "Sign out other sessions" revokes every refresh token except the current one.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/users/sessions.spec.ts`

**Page Object:** `components/SessionsCard.ts`.

**Scenarios:**
1. With 3 seeded sessions, list shows 3 rows; current session is marked "This device".
2. Click "Sign out other sessions" → confirmation dialog → snackbar "Signed out from 2 other devices"; the other sessions cannot make API calls (verified by stubbing them).
3. The current session remains valid.

## Definition of Done
- [ ] Backend revokes refresh tokens by `id` excluding the current.
