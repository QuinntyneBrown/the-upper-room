---
id: TASK-0007
title: HTTP interceptors — correlation, auth, retry, error mapping
status: Completed
phase: F
depends_on: [TASK-0001]
traces_to: [L2-084, L2-065, L2-066]
estimated_context: medium
---

# TASK-0007: HTTP interceptors

## Goal
Register four HTTP interceptors in registration order: `correlationIdInterceptor` → `authInterceptor` → `retryInterceptor` → `errorInterceptor`. Verified end-to-end against a stub `/api/v1/echo` endpoint.

## ATDD Process — REQUIRED

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/http-interceptors.spec.ts`

**Page Object:** `pages/EchoTestPage.ts` exposing `triggerSuccess()`, `triggerRetry()`, `triggerPostFailure()`, `lastCorrelationIdShown()`.

**Scenarios:**
1. **Correlation ID** — All requests have `X-Correlation-Id` set to a UUID v4.
2. **GET retry** — Stub `/api/v1/echo` to return 503 twice then 200; the page eventually succeeds (3 attempts, exponential backoff 300ms / 900ms ± jitter).
3. **POST no-retry** — Stub `POST /api/v1/echo` to return 503; the failure is surfaced once with no retry.
4. **Error mapping** — A `400` problem-detail with `code: "validation.email"` produces a snackbar with the message from the L2-066 catalog.

### Unit (frontend)
- `error-interceptor.spec.ts` — exhaustive mapping of 400/401/403/404/409/429/500/503 codes from problem-details to user messages.

## Implementation Outline

- `projects/the-upper-room/src/app/interceptors/` (one folder per interceptor; each 3-file).
- `correlationId` uses `crypto.randomUUID()`; falls back to `crypto.getRandomValues` polyfill on older WebKit.
- `auth` reads access token from in-memory token service (token service contract added here; impl in TASK-0021).
- `retry` only retries idempotent (`GET`/`HEAD`) and only on 502/503/504/network errors.

## Definition of Done

- [ ] All scenarios pass.
- [ ] Snackbar messages match L2-066 verbatim.
- [ ] No tokens written to localStorage.
