---
id: TASK-TC-6.11
title: 'Run TC-6.11 - Edit partner'
status: Completed
test_id: TC-6.11
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.11: Run TC-6.11 - Edit partner

## Goal

Run `TC-6.11` from `docs/test-plan/06-partners.md` and record the result.

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
| Run at | 2026-05-09T18:35:00Z |

### Evidence

- Clicked `data-testid="partner-edit-button"` → navigated to `/partners/p-seed/edit` ✅
- Edit form pre-populated with current partner name and website ✅
- Changed name to "Grace Church Updated" ✅
- Clicked Save → `PUT /api/v1/partners/p-seed` returned 200 ✅
- Navigated back to `/partners/p-seed`; `data-testid="partner-detail-name"` shows updated name ✅
