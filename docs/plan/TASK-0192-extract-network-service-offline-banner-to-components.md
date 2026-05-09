---
id: TASK-0192
title: Extract NetworkService and OfflineBanner to components library
status: Accepted
phase: X
depends_on: [TASK-0012]
traces_to: []
estimated_context: small
---

# TASK-0192: Extract NetworkService and OfflineBanner to components library

## Goal

Move `NetworkService` and `OfflineBanner` from `src/app/network/` into the `components` library. Both are entirely generic (browser API only, no app-specific logic) and should be available to any Angular app using the library.

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
- `frontend/projects/the-upper-room/e2e/tests/cross-cutting/offline-banner-via-library.spec.ts`

**Page Objects required (create or extend):**
- `components/OfflineBanner.ts` — existing POM; verify it still works after the move

**Scenarios:**
1. **Banner appears when offline** — Given the app is loaded, when the browser goes offline (simulated), then the offline banner is visible (no regression after library move).
2. **Banner disappears when back online** — Given the offline banner is showing, when connectivity is restored, then the banner is dismissed.

### Unit / Integration

- Frontend: `components/src/lib/network/network.service.spec.ts` — covering `bannerState` signal transitions for online → offline → online cycles.

## Implementation Outline

- **Move:** `src/app/network/network.service.ts` → `frontend/projects/components/src/lib/network/network.service.ts`
- **Move:** `src/app/network/offline-banner/` → `frontend/projects/components/src/lib/network/offline-banner/`
- **Export:** Add `NetworkService`, `OfflineBanner` to `components/public-api.ts`. Register `NetworkService` in `provideTarComponents()` so it is provided as a singleton.
- **App:** Update `AppShell` and any other consumer to import from `components`. Remove `src/app/network/` folder.

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
- [ ] `NetworkService` and `OfflineBanner` exported from `components/public-api.ts`.
- [ ] `src/app/network/` folder deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Changing the banner's visual design.
- Adding push-notification network tracking.
