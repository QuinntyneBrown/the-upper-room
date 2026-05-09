---
id: TASK-0211
title: Remove Stub placeholder component
status: Draft
phase: P
depends_on: []
traces_to: []
estimated_context: small
---

# TASK-0211: Remove Stub placeholder component

## Goal

Remove the empty `Stub` placeholder component (`src/app/stub/stub.ts`) and any route that points at it. It is an empty grid shown to internal users — not a real feature — and should not ship.

## ATDD Process — REQUIRED

1. Write the failing tests below first.
2. Confirm each fails with a meaningful assertion error.
3. Write the radically simplest code to flip them green.
4. Do not extend scope.

## Acceptance Tests

### Playwright E2E

**Spec file(s):**
- `frontend/projects/the-upper-room/e2e/tests/cleanup/stub-removed.spec.ts`

**Scenarios:**
1. Any path that previously routed to `Stub` (e.g. `/dashboard-stub`) now lands on the not-found page.
2. The application still bootstraps and the home route loads (regression check).

### Unit / Integration

- `app.routes.spec.ts` — assert no route in the table loads the `Stub` component (search by path string and by component import).

## Implementation Outline

- Identify every reference to `Stub` and `stub.ts` (route, imports, public-api exports).
- Remove the route entry from `app.routes.ts`.
- Delete `src/app/stub/` folder.
- Run `npm run lint` and `npm run typecheck`.

## Definition of Done

- [ ] e2e and unit tests pass.
- [ ] `npm run lint` and `npm run typecheck` green.
- [ ] `grep -r "stub" frontend/projects/the-upper-room/src` returns only unrelated matches (e.g. word "stub" in comments outside route table).
- [ ] Status updated to `Done`.

## Out of Scope

- Building a real component to replace `Stub`.
