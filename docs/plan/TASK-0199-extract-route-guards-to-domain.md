---
id: TASK-0199
title: Extract route guards to domain library
status: Accepted
phase: X
depends_on: [TASK-0031, TASK-0032]
traces_to: []
estimated_context: small
---

# TASK-0199: Extract route guards to domain library

## Goal

Move `authGuard`, `roleGuard`, and `permissionGuard` from `src/app/rbac/guards.ts` into the `domain` library. All three guards depend on `PermissionsService` (already in `domain`) and `ACCESS_TOKEN_SOURCE`; they are used by every protected route in the app and belong alongside the RBAC directives that are already in `domain`.

## ATDD Process — REQUIRED

This task **MUST** be implemented using ATDD:

1. Create the failing tests listed below first (Playwright e2e + unit/integration where applicable).
2. Run them. Confirm each fails with a meaningful failure message — not a build/import error.
3. Write the **radically simplest** production code to flip them green. No premature abstraction.
4. Refactor only with all tests green. Never modify production code without a failing test demanding the change.
5. Do not extend scope. If a real edge case appears that isn't in this task, file a follow-up task.

## Acceptance Tests

### Playwright E2E (Page Object Model)

**Spec file(s):**
- `frontend/projects/the-upper-room/e2e/tests/rbac/guards-via-library.spec.ts`

**Page Objects required (create or extend):**
- Existing sign-in and forbidden page POM objects.

**Scenarios:**
1. **authGuard redirects unauthenticated user** — Given the user is not signed in, when they navigate to a protected route, then they are redirected to `/sign-in` (no regression after move).
2. **roleGuard blocks insufficient role** — Given the user is signed in but lacks the required role, when they navigate to a role-guarded route, then they land on `/forbidden`.
3. **permissionGuard blocks missing permission** — Given the user lacks the required permission, when they navigate to a permission-guarded route, then they land on `/forbidden`.

### Unit / Integration

- Frontend: `domain/src/lib/rbac/guards.spec.ts` — covering each guard's allow and redirect branches.

## Implementation Outline

- **Move:** `src/app/rbac/guards.ts` → `domain/src/lib/rbac/guards.ts`
- **Export:** Add `authGuard`, `roleGuard`, `permissionGuard` to `domain/public-api.ts`.
- **App:** Update `app.routes.ts` and any lazy-loaded route files to import guards from `domain`. Remove `src/app/rbac/guards.ts`.

## Definition of Done

- [ ] All listed e2e scenarios pass on CI in headless Chromium and WebKit.
- [ ] All listed unit/integration tests pass.
- [ ] Coverage gates (L2-101) still green.
- [ ] `npm run lint`, `npm run typecheck`, `dotnet build`, `dotnet test` all green.
- [ ] Every test file added has a `// Traces to: L2-XXX` header.
- [ ] No literal user-facing strings in templates (i18n lint clean).
- [ ] No `px` margin/padding values outside the spacing token mixin (L2-003).
- [ ] No new components in single-file form (L2-081).
- [ ] BEM compliance verified by stylelint (L2-082).
- [ ] `authGuard`, `roleGuard`, `permissionGuard` exported from `domain/public-api.ts`.
- [ ] `src/app/rbac/guards.ts` deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Moving the RBAC demo page (`src/app/rbac/rbac-demo/`) — it stays in the app.
- Adding new guard types.
