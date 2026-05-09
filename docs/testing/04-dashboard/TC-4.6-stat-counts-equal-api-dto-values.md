---
id: TASK-TC-4.6
title: 'Run TC-4.6 - Stat counts equal API DTO values'
status: Completed
test_id: TC-4.6
source: ../../test-plan/04-dashboard.md
---

# TASK-TC-4.6: Run TC-4.6 - Stat counts equal API DTO values

## Goal

Run `TC-4.6` from `docs/test-plan/04-dashboard.md` and record the result.

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

API DTO: `{ contacts: 2, partners: 1, upcomingEvents: 1, openIdeas: 0 }`

UI counts:
- stat-card-contacts count = 2 ✅ (matches DTO contacts=2)
- stat-card-partners count = 1 ✅ (matches DTO partners=1)
- stat-card-upcoming-events count = 1 ✅ (matches DTO upcomingEvents=1, one draft event seeded)
- stat-card-open-ideas count = 0 ✅ (matches DTO openIdeas=0)

