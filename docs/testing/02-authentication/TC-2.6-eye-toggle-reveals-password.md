---
id: TASK-TC-2.6
title: 'Run TC-2.6 - Eye toggle reveals password'
status: Completed
test_id: TC-2.6
source: ../../test-plan/02-authentication.md
---

# TASK-TC-2.6: Run TC-2.6 - Eye toggle reveals password

## Goal

Run `TC-2.6` from `docs/test-plan/02-authentication.md` and record the result.

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
| Build SHA | ee1af6b |
| Tester | Claude (automated) |
| Run at | 2026-05-09T14:00:00Z |

### Evidence

- Navigated to `/sign-in`, entered password "TestPassword1"
- Input type = `password` initially ✅
- Clicked show-password toggle button (testId="sign-in-toggle-visibility")
- Input type = `text` ✅
- Clicked toggle again → type = `password` ✅
