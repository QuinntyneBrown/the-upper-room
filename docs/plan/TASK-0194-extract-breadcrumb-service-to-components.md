---
id: TASK-0194
title: Extract BreadcrumbService to components library
status: Completed
phase: X
depends_on: [TASK-0005]
traces_to: []
estimated_context: small
---

# TASK-0194: Extract BreadcrumbService to components library

## Goal

Move `breadcrumb.service.ts` from `src/app/shell/` into the `components` library. The service is a pure URL-to-breadcrumb conversion utility with no app-specific logic, making it suitable for any Angular application.

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
- `frontend/projects/the-upper-room/e2e/tests/cross-cutting/breadcrumbs-via-library.spec.ts`

**Page Objects required (create or extend):**
- `pages/AppShell.ts` — existing POM; add `breadcrumbs()` getter returning `Locator` if not already present.

**Scenarios:**
1. **Breadcrumbs render after move** — Given the user navigates to `/contacts/123`, then the breadcrumb trail shows `Contacts > 123` (or similar), confirming no regression after the library move.

### Unit / Integration

- Frontend: `components/src/lib/breadcrumb/breadcrumb.service.spec.ts` — covering URL segment splitting, title-casing, numeric segment skipping, and trailing slash handling.

## Implementation Outline

- **Move:** `src/app/shell/breadcrumb.service.ts` → `components/src/lib/breadcrumb/breadcrumb.service.ts`
- **Export:** Add `BreadcrumbService` to `components/public-api.ts`. Register in `provideTarComponents()`.
- **App:** Update `AppShell` to import `BreadcrumbService` from `components`. Remove the old file from `src/app/shell/`.

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
- [ ] `BreadcrumbService` exported from `components/public-api.ts`.
- [ ] `src/app/shell/breadcrumb.service.ts` deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Custom breadcrumb label overrides via route data.
- Animated breadcrumb transitions.
