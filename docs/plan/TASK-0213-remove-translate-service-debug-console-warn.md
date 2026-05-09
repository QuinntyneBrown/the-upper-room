---
id: TASK-0213
title: Remove TranslateService debug global and console.warn
status: Draft
phase: P
depends_on: []
traces_to: []
estimated_context: small
---

# TASK-0213: Remove TranslateService debug global and console.warn

## Goal

Remove the `window.__translate` global assignment in `frontend/projects/components/src/lib/i18n/translate.service.ts:14` (debug-only) and replace the bare `console.warn` for missing keys (line 26) with a logger call routed through the existing logging service. Console output and global assignments leak into production browsers and complicate test-instrumentation.

## ATDD Process — REQUIRED

1. Write the failing tests below first.
2. Confirm meaningful failures.
3. Make them green with the radically simplest code.

## Acceptance Tests

### Unit / Integration

- `translate.service.spec.ts`:
  1. Constructing the service does NOT assign anything to `window.__translate` (test under jsdom: `expect((window as any).__translate).toBeUndefined()`).
  2. Calling `translate('missing.key')` invokes the injected logger's `warn` method, NOT `console.warn` directly. Verify by spying on `console.warn` and asserting it was not called, AND on the logger spy and asserting it was called with the missing key.

### Playwright E2E

- Not required.

## Implementation Outline

- In `translate.service.ts`: delete the `window.__translate = this` line at line 14.
- Inject the existing logger service (or create a thin abstraction if none exists). Replace `console.warn(...)` with `this.logger.warn(...)`.
- `npm run lint` and `npm run typecheck`.

## Definition of Done

- [ ] Unit tests pass.
- [ ] `grep -n "console.warn\|window.__translate" frontend/projects/components/src/lib/i18n/translate.service.ts` returns no matches.
- [ ] Status updated to `Done`.

## Out of Scope

- Building a logging service from scratch — reuse what exists.
- Auditing other `console.*` calls (separate cleanup task may follow).
