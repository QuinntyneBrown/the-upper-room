# BUG-035 — e2e auth bypass lost on `page.goto()` full reload (48 of 49 kanban tests fail)

**Severity**: High
**Component**: frontend e2e infrastructure (`frontend/projects/the-upper-room/e2e/`)
**Found in test**: TC-7.1 attempt via existing `kanban/board-crud.spec.ts`
**Found**: 2026-05-09

## Description

The kanban e2e suite seeds auth in-memory immediately after navigating to `/sign-in`:

```ts
async function seedLead(page: Page, permissions: string[] = ['KanbanBoard:Create']): Promise<void> {
  await page.goto('/sign-in');
  await page.evaluate((perms) => {
    win.__setTestToken?.('lead-token');
    win.__setRbac?.({ userId: 'u1', cityId: 'Toronto', roles: ['CityLead'], permissions: perms });
  }, permissions);
}
```

It then navigates to `/boards` via `BoardsListPage.goto()` which calls `page.goto('/boards')`. `page.goto()` is a real browser navigation — it reloads the SPA, wiping the in-memory `AccessTokenStore` and `PermissionsService` state set by `__setTestToken` and `__setRbac`. The `authGuard` then redirects to `/sign-in?returnUrl=%2Fboards` and the test fails on the first `expect(...).toBeVisible()` of any board-page element.

Confirmed manually in playwright-cli: same pattern fails; switching to a SPA navigation (`history.pushState('/boards'); dispatchEvent(new PopStateEvent('popstate'))`) reaches `/boards` and the empty state renders correctly.

## Impact

`npx playwright test --project=chromium e2e/tests/kanban/` reports **48 failed, 1 passed** out of 49. Likely affects every test suite that uses the same `seedLead`/`seedAdmin` pattern with a follow-up `page.goto`.

## Reproduction

1. From `frontend/`: `npx playwright test --project=chromium e2e/tests/kanban/board-crud.spec.ts:36`.
2. Observe the failing `expect(boards.emptyState()).toBeVisible()`.
3. Open the resulting `error-context.md` — the page snapshot is the sign-in form, not the empty boards page.

## Expected

Tests that seed `__setTestToken` and `__setRbac` should be able to navigate to a guarded page and have the auth guard accept them.

## Actual

`page.goto()` resets the SPA, dropping the in-memory token. The auth guard sees no token and redirects to `/sign-in`.

## Suggested fix (ATDD)

Two reasonable options:

1. **Init script** — seed via `page.addInitScript` at `test.beforeEach`, so the token/RBAC are re-applied after every navigation. This is the canonical Playwright pattern.
2. **SPA navigation helper** — replace `page.goto('/boards')` with a router-driven navigation that does not reload the page. Brittle for first-load tests.

Option 1 is the right fix. Update each `seed*` helper (kanban, users, audit, ideas, etc.) to use `addInitScript` and persist the seed across page loads. Cover with a regression spec that asserts a guarded route is reachable after a fresh `page.goto`.
