---
id: TASK-0042
title: User detail drawer (admin actions)
status: Draft
phase: U
depends_on: [TASK-0040]
traces_to: [L2-028]
estimated_context: small
---

# TASK-0042: User detail drawer

## Goal
Click a user row → right-side drawer (480px / full-screen on XS) with avatar 96px, name, status, role, city, sign-in history (last 10), audit summary, actions: Reset password, Change role, Disable, Delete.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/users/user-drawer.spec.ts`

**Page Object:** `components/UserDetailDrawer.ts`.

**Scenarios:**
1. Click row → drawer slides in from right with the user's data.
2. Disable → confirmation dialog → status flips to "Disabled"; snackbar "User disabled"; the disabled user cannot sign in (verified via separate sign-in attempt).
3. Self-row drawer hides Disable and Delete actions.
4. Change role → role dropdown updates the user; chip in the table reflects new role.

## Definition of Done
- [ ] Disabling triggers an audit row.
