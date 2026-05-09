---
id: TASK-TC-6.13
title: 'Run TC-6.13 - Delete partner with name-confirmation'
status: Completed
test_id: TC-6.13
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.13: Run TC-6.13 - Delete partner with name-confirmation

## Goal

Run `TC-6.13` from `docs/test-plan/06-partners.md` and record the result.

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
| Build SHA | 3114dcc |
| Tester | Claude (automated) |
| Run at | 2026-05-09T18:36:00Z |
| Defect | BUG-029 (testid mismatch — non-blocking) |

### Evidence

- Navigated to `/partners/p-seed` ✅
- Clicked `data-testid="partner-delete-button"` → confirm dialog opened ✅
- Dialog title "Delete partner?" ✅
- Dialog body "Type Grace Church to confirm permanent deletion." ✅
- Confirm button disabled initially ✅
- Typed "Grace Church" into the name-confirmation input (actual `data-testid="confirm-typed-input"`) ✅
- Confirm button (Delete) became enabled ✅
- Clicked Delete → `DELETE /api/v1/partners/p-seed` returned 204 ✅
- Partner removed from list ✅

### Defect

BUG-029: Test plan specifies `data-testid="delete-confirm-input"` but `tar-confirm-dialog` uses `data-testid="confirm-typed-input"`. The feature works correctly; only the test plan attribute name is wrong.
