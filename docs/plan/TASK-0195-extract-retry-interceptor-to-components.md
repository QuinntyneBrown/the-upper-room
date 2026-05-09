---
id: TASK-0195
title: Extract retryInterceptor to components library
status: Accepted
phase: X
depends_on: [TASK-0007]
traces_to: []
estimated_context: small
---

# TASK-0195: Extract retryInterceptor to components library

## Goal

Move `retry.interceptor.ts` from `src/app/interceptors/` into the `components` library. The interceptor is pure RxJS with no app-specific imports; it retries idempotent requests on transient failures using exponential back-off with jitter, making it reusable in any Angular HTTP stack.

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
- `frontend/projects/the-upper-room/e2e/tests/cross-cutting/retry-interceptor-via-library.spec.ts`

**Page Objects required (create or extend):**
- None — use network interception in Playwright to simulate 503 responses.

**Scenarios:**
1. **GET retries on 503** — Given the server returns 503 twice then 200, when the app makes a GET request, then the response succeeds and no error is shown to the user (confirming the interceptor still runs after the move).

### Unit / Integration

- Frontend: `components/src/lib/interceptors/retry.interceptor.spec.ts` — covering: only GET/HEAD retried, max 3 attempts, exponential delay, non-retryable methods (POST) pass through immediately.

## Implementation Outline

- **Move:** `src/app/interceptors/retry.interceptor.ts` → `components/src/lib/interceptors/retry.interceptor.ts`
- **Export:** Add `retryInterceptor` to `components/public-api.ts`.
- **App:** Update `app.config.ts` to import `retryInterceptor` from `components`. Remove `src/app/interceptors/retry.interceptor.ts`.
- **No logic changes:** Retry thresholds, back-off formula, and jitter stay identical.

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
- [ ] `retryInterceptor` exported from `components/public-api.ts`.
- [ ] `src/app/interceptors/retry.interceptor.ts` deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Making retry counts configurable via injection token (file a follow-up if needed).
- Moving `correlationIdInterceptor`, `authInterceptor`, or `errorInterceptor` (those are app-specific).
