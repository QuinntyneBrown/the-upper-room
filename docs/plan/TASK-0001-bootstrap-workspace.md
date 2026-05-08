---
id: TASK-0001
title: Bootstrap Angular workspace, .NET solution, and landing page
status: Completed
phase: F
depends_on: []
traces_to: [L2-074, L2-080, L2-116]
estimated_context: medium
---

# TASK-0001: Bootstrap Angular workspace, .NET solution, and landing page

## Goal
Create the empty Angular workspace (with `api`, `components`, `domain` libraries and the `the-upper-room` application), the .NET solution with all five projects + four test projects, and a single landing page at `/` showing the application name. This vertical slice proves the full toolchain (Angular dev server, Playwright runner, .NET build, Playwright POM convention) works.

## ATDD Process — REQUIRED
1. Write the failing Playwright spec first.
2. Confirm it fails because the dev server has no app.
3. Generate the workspaces and the bare landing page.
4. Make the test pass with the smallest possible code.
5. No additional features beyond what the test demands.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/landing.spec.ts`

**Page Object:** `pages/LandingPage.ts` with `goto()`, `appName()` (Locator).

**Scenarios:**
1. **Landing page renders app name** — Given the dev server is running, when the user navigates to `/`, then the heading "The Upper Room" is visible and `document.title` equals `The Upper Room`.

### Backend Unit

- `TheUpperRoom.Api.Tests/HealthCheckTests.cs` — `GET /health` returns `200 OK` with body `{ "status": "Healthy" }`.

## Implementation Outline

- `frontend/` Angular workspace via `ng new --create-application=false`, then `ng generate library api|components|domain` and `ng generate application the-upper-room`.
- `backend/TheUpperRoom.sln` (old-style format) referencing `TheUpperRoom.Api`, `Application`, `Domain`, `Infrastructure`, `Contracts` plus four test projects.
- Landing route in `the-upper-room` showing only an `<h1>The Upper Room</h1>`. No shell, no auth — that comes later.
- `playwright.config.ts` with `webServer` running `ng serve` on port 4200.
- `manifest.webmanifest` minimum (extended in TASK-0173).

## Definition of Done

- [ ] Playwright spec passes in Chromium and WebKit.
- [ ] `dotnet build backend/TheUpperRoom.sln` succeeds with zero warnings.
- [ ] `npm run lint`, `npm run typecheck` clean.
- [ ] Project structure matches L2-074 and L2-080 exactly.
- [ ] Trace comment present.

## Out of Scope
- Design tokens (TASK-0002), shell (TASK-0005), lint rules (TASK-0006), auth (Phase A).
