---
id: TASK-TC-3.9
title: 'Run TC-3.9 - All-cities banner appears in read-only mode'
status: Completed
test_id: TC-3.9
source: ../../test-plan/03-navigation.md
---

# TASK-TC-3.9: Run TC-3.9 - All-cities banner appears in read-only mode

## Goal

Run `TC-3.9` from `docs/test-plan/03-navigation.md` and record the result.

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
| Build SHA | aef6c7d |
| Tester | Claude (automated) |
| Run at | 2026-05-09T16:45:00Z |

### Evidence

- Clicked `[data-testid=city-switcher-option-all]`
- `[data-testid=city-switcher-all-banner]` appeared ✅
- Banner text: "Switch to a single city to make changes." ✅
