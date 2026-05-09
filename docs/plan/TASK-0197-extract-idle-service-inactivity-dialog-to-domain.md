---
id: TASK-0197
title: Extract IdleService and InactivityDialog to domain library
status: Accepted
phase: X
depends_on: [TASK-0027, TASK-0198]
traces_to: []
estimated_context: small
---

# TASK-0197: Extract IdleService and InactivityDialog to domain library

## Goal

Move `idle.service.ts` and `inactivity-dialog/` from `src/app/auth/` into the `domain` library. These are cross-cutting session management concerns that depend on `SignOutService` (also being moved to `domain` in TASK-0198) and `ACCESS_TOKEN_SOURCE`.

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
- `frontend/projects/the-upper-room/e2e/tests/auth/inactivity-dialog-via-library.spec.ts`

**Page Objects required (create or extend):**
- `components/InactivityDialog.ts` — existing POM; verify it still works after the move.

**Scenarios:**
1. **Inactivity dialog appears after idle** — Given the user is signed in and idle (simulated with fast-forwarded timer), when the idle threshold is crossed, then the inactivity warning dialog is shown (no regression after move).
2. **Countdown triggers sign-out** — Given the inactivity dialog is open, when the countdown expires without user action, then the user is signed out and redirected to `/sign-in`.

### Unit / Integration

- Frontend: `domain/src/lib/auth/idle.service.spec.ts` — covering activity event reset, `warningActive` signal transition, and auto sign-out after countdown.

## Implementation Outline

- **Move:** `src/app/auth/idle.service.ts` → `domain/src/lib/auth/idle.service.ts`
- **Move:** `src/app/auth/inactivity-dialog/` → `domain/src/lib/auth/inactivity-dialog/`
- **Dependencies:** Both files already depend on `ACCESS_TOKEN_SOURCE` (app token) and `SignOutService`. After TASK-0198 moves `SignOutService` to `domain`, the import resolves within the same library.
- **Export:** Add `IdleService`, `InactivityDialog` to `domain/public-api.ts`. Register `IdleService` in `provideDomain()`.
- **App:** Update `AppShell` (or wherever the inactivity dialog is mounted) to import from `domain`. Remove the old files from `src/app/auth/`.

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
- [ ] `IdleService` and `InactivityDialog` exported from `domain/public-api.ts`.
- [ ] `src/app/auth/idle.service.ts` and `src/app/auth/inactivity-dialog/` deleted.
- [ ] Status updated to `Done` in the task frontmatter.

## Out of Scope

- Making idle timeout duration configurable (hard-coded 30 min + 1 min warning stays).
- Moving the PKCE auth provider or other auth implementation files.
