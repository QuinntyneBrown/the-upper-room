---
id: TASK-0210
title: Remove debug & demo routes from frontend
status: Accepted
phase: P
depends_on: []
traces_to: []
estimated_context: small
---

# TASK-0210: Remove debug & demo routes from frontend

## Goal

Delete debug-only routes and their components from the shipped Angular app: `echo-test`, `__throw`, `__rbac-demo`, and `date-formatting-test`. These were added for manual verification and have no end-user value. Leaving them in the production bundle is a UX and minor information-disclosure concern.

## ATDD Process — REQUIRED

1. Write the failing tests below.
2. Confirm each fails with a meaningful assertion error (not a build error).
3. Write the radically simplest code to flip them green.
4. Refactor only while green.
5. Do not extend scope.

## Acceptance Tests

### Playwright E2E (Page Object Model)

**Spec file(s):**
- `frontend/projects/the-upper-room/e2e/tests/cleanup/debug-routes-removed.spec.ts`

**Page Objects required:**
- `e2e/components/NotFoundPage.ts` — verifies 404 / not-found state.

**Scenarios:**
1. Visiting `/echo-test` lands on the not-found page.
2. Visiting `/__throw` lands on the not-found page.
3. Visiting `/__rbac-demo` lands on the not-found page.
4. Visiting `/date-formatting-test` lands on the not-found page.

### Unit / Integration

- `app.routes.spec.ts` — assert the route table contains no path starting with `__`, equal to `echo-test`, or ending in `-test`.

## Implementation Outline

- Remove the four route entries from `frontend/projects/the-upper-room/src/app/app.routes.ts` (lines 53, 55, 56, 105 per audit).
- Delete component folders: `src/app/echo-test/`, `src/app/rbac/rbac-demo/`, and the `date-formatting-test` component referenced at line 105.
- Remove their entries from any lazy-loaded module barrels.
- Run `npm run lint` and `npm run typecheck`.

## Definition of Done

- [ ] All listed e2e scenarios pass in Chromium and WebKit.
- [ ] Unit test asserting clean route table passes.
- [ ] `npm run lint` and `npm run typecheck` green.
- [ ] `grep -r "echo-test\|__throw\|__rbac-demo\|date-formatting-test" frontend/projects/the-upper-room/src` returns no matches.
- [ ] Status updated to `Done`.

## Out of Scope

- Replacing the deleted components with new functionality.
- Auditing routes beyond the four listed.
