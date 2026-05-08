---
id: TASK-0026
title: Sign out (revoke + clear)
status: Completed
phase: A
depends_on: [TASK-0021]
traces_to: [L2-021, L2-012]
estimated_context: small
---

# TASK-0026: Sign out

## Goal
Wire the avatar menu's "Sign out" item to a confirmation dialog → revoke refresh token → clear in-memory access token + NgRx state → redirect to `/sign-in?signedOut=1` with snackbar "You've been signed out.".

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/auth/sign-out.spec.ts`

**Page Object:** `components/AppShell.ts` (`avatarTrigger()`, `avatarMenuItem(label)`).

**Scenarios:**
1. **Happy path** — Sign in, open avatar menu, click "Sign out", confirm dialog → redirect to `/sign-in?signedOut=1`; snackbar visible 4000ms.
2. **Revocation** — Network log shows `POST /api/v1/auth/sign-out`; refresh-cookie cleared.
3. **Cancel** — Cancel in confirm dialog leaves the user on the current page, still authenticated.

## Definition of Done
- [ ] No NgRx state survives sign-out (verified by store snapshot).
