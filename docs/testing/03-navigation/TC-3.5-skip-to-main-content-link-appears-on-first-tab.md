---
id: TASK-TC-3.5
title: 'Run TC-3.5 - Skip-to-main-content link appears on first Tab'
status: Completed
test_id: TC-3.5
source: ../../test-plan/03-navigation.md
---

# TASK-TC-3.5: Run TC-3.5 - Skip-to-main-content link appears on first Tab

## Goal

Run `TC-3.5` from `docs/test-plan/03-navigation.md` and record the result.

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

- `<a data-testid="skip-link" href="#main">Skip to main content</a>` present ✅
- Skip link is off-screen initially (position: absolute, top<0) ✅
- After Tab: `[data-testid=skip-link]` is focused and visible ✅
- After Enter: `document.activeElement.id === 'main'` (skip link focused main) ✅
