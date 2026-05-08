---
id: TASK-0030
title: Roles, permissions, and seed data
status: Completed
phase: R
depends_on: [TASK-0021]
traces_to: [L2-023, L2-078]
estimated_context: medium
---

# TASK-0030: RBAC core

## Goal
Create `Roles`, `Permissions`, `RolePermissions`, `UserRoles` tables and seed the four canonical roles (`SystemAdmin`, `CityLead`, `Member`, `Guest`) with the permission tuples in L2-023. Expose `GET /api/v1/users/me` returning effective permissions.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/rbac/permissions-endpoint.spec.ts`

**Page Object:** `pages/MyProfilePage.ts` (placeholder; full impl in TASK-0043) or a test-only `/__rbac` page.

**Scenarios:**
1. As a seeded SystemAdmin user, after sign-in, `GET /users/me` returns `roles: ["SystemAdmin"]` and `permissions` includes `User:Manage`, `Audit:Read`.
2. As a seeded Member, the response excludes `Contact:Create`.
3. A seeded Guest can only read events and RSVP.

### Backend Integration
- `Roles/RolePermissionTests.cs` — exhaustive matrix per L2-023.
- Migration test verifies seeded rows.

## Definition of Done
- [ ] Migration runs idempotently.
- [ ] `/users/me` cached per session (no DB hit per request).
