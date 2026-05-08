---
id: TASK-0011
title: Static error pages — 404, 403, 500 boundary
status: Draft
phase: F
depends_on: [TASK-0005]
traces_to: [L2-067, L2-068, L2-069]
estimated_context: small
---

# TASK-0011: Static error pages

## Goal
Provide the wildcard 404 page, the `/forbidden` 403 page, and a global error boundary that catches unhandled runtime errors and renders the 500 view with a copyable correlation ID.

## ATDD Process — REQUIRED

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/error-pages.spec.ts`

**Page Objects:** `pages/NotFoundPage.ts`, `pages/ForbiddenPage.ts`, `pages/ErrorBoundaryPage.ts`.

**Scenarios:**
1. Navigating to `/no-such-route` shows the 404 page with icon `search_off`, heading "Page not found"; URL stays `/no-such-route`.
2. Visiting `/forbidden` shows the 403 page with icon `block` and "Go to dashboard" filled button.
3. Triggering a deliberate render error (test-only `/__throw` route) renders the 500 boundary with copyable correlation id; "Reload page" button reloads the route.

## Implementation Outline
- `projects/the-upper-room/src/app/error/` with three components and a global `ErrorHandler`.
- Test-only `/__throw` route registered in `environment.test = true`.

## Definition of Done
- [ ] All three scenarios green.
- [ ] Correlation id is copy-to-clipboard; fallback when Clipboard API unavailable.
