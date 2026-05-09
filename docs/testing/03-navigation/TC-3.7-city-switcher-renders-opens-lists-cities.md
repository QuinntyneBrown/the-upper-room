---
id: TASK-TC-3.7
title: 'Run TC-3.7 - City switcher renders, opens, lists cities'
status: Completed
test_id: TC-3.7
source: ../../test-plan/03-navigation.md
---

# TASK-TC-3.7: Run TC-3.7 - City switcher renders, opens, lists cities

## Goal

Run `TC-3.7` from `docs/test-plan/03-navigation.md` and record the result.

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

- `[data-testid=city-switcher-trigger]` present, text "All cities" ✅
- Clicked trigger → `<ul data-testid="city-switcher-menu" role="menu">` opened ✅
- Items: `[data-testid=city-switcher-option-toronto]` (role="menuitem"), `[data-testid=city-switcher-option-halifax]` (role="menuitem") ✅
- Final item: `[data-testid=city-switcher-option-all]` "All cities (read-only) ✓" ✅
