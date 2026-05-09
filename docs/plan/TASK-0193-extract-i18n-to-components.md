---
id: TASK-0193
title: Extract TranslateService and transloco pipe to components library
status: Completed
phase: X
depends_on: [TASK-0013]
traces_to: []
estimated_context: small
---

# TASK-0193: Extract TranslateService and transloco pipe to components library

## Goal

Move `TranslateService` and the `transloco` pipe from `src/app/i18n/` into the `components` library. The service and pipe are dictionary-agnostic utilities; only `dictionaries.ts` (the app-specific translation content) stays in the app. A `TRANSLATE_DICTIONARIES` injection token decouples the library from any particular locale content.

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
- `frontend/projects/the-upper-room/e2e/tests/cross-cutting/i18n-via-library.spec.ts`

**Page Objects required (create or extend):**
- No new POM — use existing sign-in page or any page with translated strings.

**Scenarios:**
1. **Strings translate correctly after move** — Given the app is loaded, then all user-facing strings that use the `transloco` pipe still render their translated values (no `undefined` or key echoes).

### Unit / Integration

- Frontend: `components/src/lib/i18n/translate.service.spec.ts` — covering `translate(key)` lookup, locale switching via signal, and fallback to key name on missing translation.

## Implementation Outline

- **Introduce token:** Add `TRANSLATE_DICTIONARIES = new InjectionToken<Record<string, Record<string, string>>>('TRANSLATE_DICTIONARIES')` in the components library.
- **Move:** `src/app/i18n/translate.service.ts` → `components/src/lib/i18n/translate.service.ts`. Replace hard-coded `import { DICTIONARIES }` with `inject(TRANSLATE_DICTIONARIES)`.
- **Move:** `src/app/i18n/transloco.pipe.ts` → `components/src/lib/i18n/transloco.pipe.ts`.
- **Export:** Add `TranslateService`, `TranslocoPipe`, `TRANSLATE_DICTIONARIES` to `components/public-api.ts`. Register `TranslateService` in `provideTarComponents()`. Add a `withDictionaries(dicts)` helper to `provideTarComponents()` for supplying the token.
- **App:** In `app.config.ts`, call `provideTarComponents({ dictionaries: DICTIONARIES })` (or equivalent). Update all imports from `components`. Remove `src/app/i18n/translate.service.ts` and `src/app/i18n/transloco.pipe.ts`. Keep `src/app/i18n/dictionaries.ts`.

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
- [ ] `TranslateService`, `TranslocoPipe`, `TRANSLATE_DICTIONARIES` exported from `components/public-api.ts`.
- [ ] `src/app/i18n/translate.service.ts` and `transloco.pipe.ts` deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Switching to a third-party i18n library (Transloco npm package).
- Adding plural or ICU message support.
- Moving `dictionaries.ts` — it stays in the app.
