---
id: TASK-TC-4.4
title: 'Run TC-4.4 - Upcoming Events widget'
status: Completed
test_id: TC-4.4
source: ../../test-plan/04-dashboard.md
---

# TASK-TC-4.4: Run TC-4.4 - Upcoming Events widget

## Goal

Run `TC-4.4` from `docs/test-plan/04-dashboard.md` and record the result.

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
| Run at | 2026-05-09T17:20:00Z |

### Evidence

- `[data-testid=dashboard-upcoming-events]` present ✅
- Heading "Upcoming Events" ✅
- "View calendar" link routes to `/events` ✅
- Empty state text "No upcoming events." shown (no seeded future events) ✅

