---
id: TASK-0032
title: Frontend route guards (auth + role)
status: Completed
phase: R
depends_on: [TASK-0020, TASK-0030]
traces_to: [L2-024]
estimated_context: small
---

# TASK-0032: Route guards

## Goal
`authGuard` redirects unauthenticated users to `/sign-in?returnUrl=...`. `roleGuard` checks `data.roles` and redirects to `/forbidden` with the prescribed snackbar.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/rbac/guards.spec.ts`

**Scenarios:**
1. **Unauthenticated** → `/contacts` redirects to `/sign-in?returnUrl=%2Fcontacts`; after sign-in, lands on `/contacts`.
2. **Member** → `/admin/users` redirects to `/forbidden`; warning snackbar "You don't have permission to view this page." appears for 5000ms.
3. **SystemAdmin** → `/admin/users` loads normally.

## Definition of Done
- [ ] Returnurl preserved through PKCE redirect.
