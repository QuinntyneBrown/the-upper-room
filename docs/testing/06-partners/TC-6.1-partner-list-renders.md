---
id: TASK-TC-6.1
title: 'Run TC-6.1 - Partner list renders'
status: Completed
test_id: TC-6.1
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.1: Run TC-6.1 - Partner list renders

## Goal

Run `TC-6.1` from `docs/test-plan/06-partners.md` and record the result.

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
| Run at | 2026-05-09T18:30:00Z |

### Evidence

- Navigated to `/partners` ✅
- `data-testid="partners-search"` (type=search, placeholder="Search partners…") visible ✅
- `data-testid="partners-filter-archived"` chip with text "Archived" visible ✅
- `data-testid="partners-new-button"` present for admin user ✅
- `data-testid="partners-grid"` renders with seed partner card ✅
- `data-testid="partner-card-Grace Church"` present; letter avatar "G" shown (no logo) ✅
- Contact count "0 contacts" rendered correctly ✅
- `GET /api/v1/partners` API call confirmed in network log ✅
