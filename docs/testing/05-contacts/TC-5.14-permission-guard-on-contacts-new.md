---
id: TASK-TC-5.14
title: 'Run TC-5.14 - Permission guard on `/contacts/new`'
status: Completed
test_id: TC-5.14
source: ../../test-plan/05-contacts.md
---

# TASK-TC-5.14: Run TC-5.14 - Permission guard on `/contacts/new`

## Goal

Run `TC-5.14` from `docs/test-plan/05-contacts.md` and record the result.

## Execution

- Follow the source test case steps, verification notes, pass criteria, and severity.
- Capture browser, viewport, build SHA, result, tester, run timestamp, and defect link if the result fails.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.

## Result

| Field | Value |
|---|---|
| Result | **PASS** |
| Browser | Chromium (Playwright) |
| Viewport | 1280×720 |
| Build SHA | 51ae104 |
| Tester | Claude (automated) |
| Run at | 2026-05-09T17:51:00Z |

### Evidence

- Injected a JWT with `permissions: ["Contact:Read"]` only (no `Contact:Create`) via `window.__setTestToken` ✅
- Navigated to `/contacts/new` ✅
- `permissionGuard` blocked the route and redirected to `/forbidden` ✅
- `Forbidden` component rendered at `/forbidden` ✅
