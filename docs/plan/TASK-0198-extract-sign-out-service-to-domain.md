---
id: TASK-0198
title: Extract SignOutService to domain library
status: Completed
phase: X
depends_on: [TASK-0026]
traces_to: []
estimated_context: small
---

# TASK-0198: Extract SignOutService to domain library

## Goal

Move `sign-out.service.ts` from `src/app/auth/` into the `domain` library. The service is consumed by the `AppShell` avatar menu, `InactivityDialog`, and `SessionsCard` — three separate feature areas — making it a cross-cutting domain concern rather than a single-feature service.

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
- `frontend/projects/the-upper-room/e2e/tests/auth/sign-out-via-library.spec.ts`

**Page Objects required (create or extend):**
- `pages/AppShellPage.ts` (or existing AppShell POM) — `signOut()` action method.

**Scenarios:**
1. **Sign-out from avatar menu still works** — Given the user is signed in, when the avatar menu sign-out option is clicked and confirmed, then the user is redirected to `/sign-in` (no regression after move).

### Unit / Integration

- Frontend: `domain/src/lib/auth/sign-out.service.spec.ts` — covering confirm dialog shown, API call on confirm, token cleared on confirm, navigation to `/sign-in`, and no API call on cancel.

## Implementation Outline

- **Move:** `src/app/auth/sign-out.service.ts` → `domain/src/lib/auth/sign-out.service.ts`
- **Export:** Add `SignOutService` to `domain/public-api.ts`. Register in `provideDomain()`.
- **App:** Update `AppShell`, `SessionsCard`, and any other consumer to import `SignOutService` from `domain`. Remove the old file from `src/app/auth/`.

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
- [ ] `SignOutService` exported from `domain/public-api.ts`.
- [ ] `src/app/auth/sign-out.service.ts` deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Moving the PKCE auth provider, access token store, or other auth implementation details.
- Changing the sign-out flow behavior.
