---
id: TASK-TC-6.12
title: 'Run TC-6.12 - Archive partner'
status: Completed
test_id: TC-6.12
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.12: Run TC-6.12 - Archive partner

## Goal

Run `TC-6.12` from `docs/test-plan/06-partners.md` and record the result.

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
| Run at | 2026-05-09T18:35:30Z |

### Evidence

- Navigated to `/partners/p-seed` ✅
- `data-testid="partner-archive-button"` visible ✅
- Clicked Archive → `PATCH /api/v1/partners/p-seed` with `{ archived: true }` called ✅
- Button changed to `data-testid="partner-restore-button"` with text "Restore" ✅
- Navigated to `/partners`; seed partner card has `partner-card--archived` CSS class ✅
- Clicked Restore → button reverted to "Archive" ✅
