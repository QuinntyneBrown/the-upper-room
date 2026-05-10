# Bug Log

Bugs filed while executing `docs/test-plan/` against the locally running app on 2026-05-09.

## How this run was conducted

- Backend: `dotnet run` from `backend/src/TheUpperRoom.Api/` on `http://localhost:5255` (`ASPNETCORE_ENVIRONMENT=Development`).
- Frontend: `npx ng serve the-upper-room --port 4300` (port 4200 was already occupied by another dev server).
- Automated coverage: `npx playwright test --project=chromium` — **76/76 passed** in 18 minutes.
- Manual coverage: API smoke tests with `curl` against every documented endpoint, and source-level verification of UI flows that the test plan flagged as `[unverified]`.
- Out of scope this run: pixel/font visual checks (no human eye), webkit/firefox cross-browser pass, accessibility/screen-reader audit.

## Defect index

| ID | Severity | Component | Title |
|---|---|---|---|
| [BUG-001](BUG-001-missing-auth-endpoints.md) | Critical | backend | `sign-up`, `reset-password`, `verify-email`, `verify-email/resend` endpoints return 404 |
| [BUG-002](BUG-002-sign-in-always-401.md) | Critical | backend | `POST /api/v1/auth/sign-in` always returns 401 — no success path |
| [BUG-003](BUG-003-exchange-token-rejected.md) | Critical | backend | Token issued by `/auth/exchange` has `sub="anonymous"` and is rejected by every authorized controller |
| [BUG-004](BUG-004-brand-not-clickable.md) | Medium | frontend | "The Upper Room" brand text in top bar is not clickable |
| [BUG-005](BUG-005-contact-archive-missing.md) | High | backend+frontend | Contact archive flow not implemented (no endpoint, no field) |
| [BUG-006](BUG-006-partner-logo-upload-missing.md) | High | frontend | Partner-create form has no Logo upload field |
| [BUG-007](BUG-007-add-card-button-missing.md) | Critical | frontend | Kanban board view has no "+ Add card" button |
| [BUG-008](BUG-008-card-move-button-missing.md) | Medium | frontend | Card detail dialog has no "Move" button (mobile flow broken) |
| [BUG-009](BUG-009-new-idea-button-missing.md) | Critical | frontend | Idea list page has no "New idea" button |
| [BUG-010](BUG-010-idea-comments-missing.md) | High | frontend+backend | Idea detail page has no comments section |
| [BUG-011](BUG-011-digest-frequency-missing.md) | Low | frontend | Notification preferences page has no digest-frequency control |
| [BUG-012](BUG-012-frontend-build-requires-libs-first.md) | High | docs | Frontend dev server fails to compile on a fresh clone without first building workspace libs |
| [BUG-013](BUG-013-user-guide-credentials-stale.md) | High | docs | User guide credentials block (added earlier today) is stale — `MockAuthProvider` was removed by `TASK-0212` |
| [BUG-014](BUG-014-test-plan-stale-persistence.md) | Medium | docs | Test plan describes in-memory persistence, but backend now uses SQLite (`ContactsDbContext`, `EventsDbContext`, etc.) |
| [BUG-035](BUG-035-e2e-auth-bypass-lost-on-page-goto.md) | High | frontend e2e | `page.goto()` after seeding `__setTestToken`/`__setRbac` reloads the SPA and drops the token; 48 of 49 kanban tests fail at the auth-guard redirect |
| [BUG-036](BUG-036-error-boundary-triggered-by-http-errors.md) | High | frontend | `GlobalErrorHandler` raises the full-page error boundary for every `HttpErrorResponse`; overlay intercepts clicks and breaks ~28 kanban e2e tests |

## What passed

- Backend boots cleanly in Development with default `Jwt:SigningKey` fallback.
- `GET /health` returns `{"status":"Healthy"}`.
- All 14 documented API resource endpoints correctly require authentication (return `401` without a bearer token).
- Frontend serves `200 OK` at `/` and the document `<title>` is "The Upper Room".
- Playwright e2e suite (`--project=chromium`): **76 passed, 0 failed** across feature areas: notes, notifications, partners, tags, users, hardening, kanban, ideas, etc.
