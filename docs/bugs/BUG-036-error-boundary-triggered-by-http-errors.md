# BUG-036 — Global error boundary triggered by every HTTP error, intercepting all clicks (RESOLVED 2026-05-09)

**Severity**: High
**Component**: frontend (`projects/the-upper-room/src/app/error/global-error-handler.ts`)
**Found in test**: TC-7.16 (board-view.spec.ts:100 — Tag=VIP filter), and ~28 other kanban e2e tests
**Found**: 2026-05-09
**Status**: FIXED 2026-05-09 — `GlobalErrorHandler.handleError` now returns early when the error is (or wraps) an `HttpErrorResponse`. HTTP errors are surfaced by `errorInterceptor` snackbars; only genuinely uncaught application errors raise the catastrophic boundary now (commit `205dd5e`).

## Description

`GlobalErrorHandler.handleError` calls `this.boundary.raise()` for *any* error reaching the
zone-level handler. The HTTP `errorInterceptor` already catches `HttpErrorResponse`, surfaces a
snackbar, and re-throws so consumers can react — but the re-thrown error propagates to the
`GlobalErrorHandler`, which then raises the full-page error boundary overlay.

In the e2e suite, any test that touches a route making an unmocked API call (commonly
`/api/v1/notifications`, surfaced from the notification bell) ends up with the
`<div data-testid="error-boundary">` covering the page. The overlay has `pointer-events: auto`,
so subsequent click locators like `getByTestId('board-tag-filter-VIP').click()` time out
because the overlay intercepts the click.

## Reproduction

1. With backend down (or `/api/v1/notifications` returning 500), open `/boards/b1` after seeding
   `__setTestToken` / `__setRbac`.
2. The board renders correctly behind the overlay, but `<app-error-boundary>` covers the screen
   with title "Something went wrong" and a fresh `correlationId`.
3. Trying to click any board control fails because the overlay sits in front.

In Playwright runs (after fixing BUG-035), this surfaces as `30s` timeouts on `locator.click`
with the call log `<div role="alert" class="error-boundary"...> subtree intercepts pointer events`.

## Expected

`HttpErrorResponse`s are already handled by `errorInterceptor` (snackbar + re-throw). They
should not also trigger the catastrophic-error boundary. The boundary is intended for genuinely
uncaught application errors (component template errors, programmer mistakes) — not transient
network or 500 responses, which the user can recover from with the next interaction.

## Actual

Every HTTP error escalates to the full-page boundary, blocking interaction across the whole app
until the user clicks **Reload page**.

## Suggested fix

In `GlobalErrorHandler.handleError`, skip the `boundary.raise()` call for `HttpErrorResponse`
errors (and, by extension, the `RxJS` wrapper that re-throws them). Add a regression spec that
hits a route that fires a 5xx and asserts the overlay is *not* shown.

```ts
handleError(error: unknown): void {
  console.error(error);
  if (error instanceof HttpErrorResponse) return; // already handled by errorInterceptor
  this.boundary.raise();
}
```
