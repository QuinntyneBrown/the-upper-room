---
id: TASK-0200
title: Extract ThemeService to domain library
status: Completed
phase: X
depends_on: [TASK-0014]
traces_to: []
estimated_context: small
---

# TASK-0200: Extract ThemeService to domain library

## Goal

Move `theme.service.ts` from `src/app/theme/` into the `domain` library. The service is consumed by `AppShell` and the appearance settings page, and it syncs the user's preference to `/api/v1/users/me` when authenticated — making it a cross-cutting domain concern that should be co-located with other app-wide services.

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
- `frontend/projects/the-upper-room/e2e/tests/cross-cutting/theme-service-via-library.spec.ts`

**Page Objects required (create or extend):**
- `pages/AppearanceSettingsPage.ts` — existing POM.

**Scenarios:**
1. **Theme toggle still works** — Given the user is on the appearance settings page, when they switch from light to dark mode, then the `data-theme` attribute on `<html>` changes to `dark` (no regression after move).
2. **Preference persists across reload** — Given dark mode was selected, when the page reloads, then the dark theme is applied immediately (localStorage persistence).

### Unit / Integration

- Frontend: `domain/src/lib/theme/theme.service.spec.ts` — covering mode cycling, localStorage read/write, and DOM attribute application.

## Implementation Outline

- **Move:** `src/app/theme/theme.service.ts` → `domain/src/lib/theme/theme.service.ts`
- **Export:** Add `ThemeService` to `domain/public-api.ts`. Register in `provideDomain()`.
- **App:** Update `AppShell`, appearance settings, and any other consumer to import `ThemeService` from `domain`. Remove `src/app/theme/` folder.

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
- [ ] `ThemeService` exported from `domain/public-api.ts`.
- [ ] `src/app/theme/` folder deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Changing the theme token system or SCSS variables.
- Adding per-user server-side theme persistence beyond the existing API sync.
