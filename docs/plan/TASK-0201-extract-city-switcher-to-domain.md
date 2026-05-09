---
id: TASK-0201
title: Extract CitySwitcher to domain library
status: Done
phase: X
depends_on: [TASK-0051]
traces_to: []
estimated_context: small
---

# TASK-0201: Extract CitySwitcher to domain library

## Goal

Move `city-switcher/` from `src/app/cities/` into the `domain` library and rename its selector to `tar-city-switcher`. The component is embedded in `AppShell` and depends on `CityScopeService` and `PERMISSIONS_SERVICE` — cross-cutting domain services — making it a domain-layer component.

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
- `frontend/projects/the-upper-room/e2e/tests/cities/city-switcher-via-library.spec.ts`

**Page Objects required (create or extend):**
- Existing city-switcher POM or AppShell POM with a `citySwitcher()` getter.

**Scenarios:**
1. **City switcher renders in shell** — Given a SystemAdmin user is signed in, when the app shell loads, then the city switcher dropdown is visible (no regression after move).
2. **City selection scopes data** — Given the city switcher shows "All Cities", when the user selects a specific city, then the city scope changes and relevant data is filtered.

### Unit / Integration

- Frontend: `domain/src/lib/cities/tar-city-switcher.spec.ts` — covering city list loading and `City:Switch` permission check.

## Implementation Outline

- **Move:** `src/app/cities/city-switcher/` → `domain/src/lib/cities/city-switcher/`
- **Rename selector:** `app-city-switcher` → `tar-city-switcher`. Update `AppShell` template.
- **Export:** Add `TarCitySwitcher` to `domain/public-api.ts`. Register in `provideDomain()`.
- **App:** Update `AppShell` to import `TarCitySwitcher` from `domain`. Remove the old folder from `src/app/cities/`.

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
- [ ] `TarCitySwitcher` exported from `domain/public-api.ts` with selector `tar-city-switcher`.
- [ ] `src/app/cities/city-switcher/` folder deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Moving the city admin CRUD pages — they stay in the app.
- Moving `CityScopeService` (assess separately if needed).
