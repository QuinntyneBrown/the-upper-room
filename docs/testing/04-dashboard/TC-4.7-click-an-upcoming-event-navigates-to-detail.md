---
id: TASK-TC-4.7
title: 'Run TC-4.7 - Click an upcoming event navigates to detail'
status: Completed
test_id: TC-4.7
source: ../../test-plan/04-dashboard.md
---

# TASK-TC-4.7: Run TC-4.7 - Click an upcoming event navigates to detail

## Goal

Run `TC-4.7` from `docs/test-plan/04-dashboard.md` and record the result.

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
| Build SHA | 969d71f |
| Tester | Claude (automated) |
| Run at | 2026-05-09T17:22:00Z |

### Evidence

- Created test event "Test Community Gathering" (future date) via API
- Event appeared in Upcoming Events widget on dashboard ✅
- Clicked `[data-testid=upcoming-event-51b813d5-6758-4e64-ac12-d666b8e4930c]` ✅
- URL became `/events/51b813d5-6758-4e64-ac12-d666b8e4930c` ✅
- Event detail page rendered (title "Test Community Gathering", status "Draft") ✅

