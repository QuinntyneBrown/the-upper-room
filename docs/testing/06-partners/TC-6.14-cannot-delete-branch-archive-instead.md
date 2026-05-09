---
id: TASK-TC-6.14
title: 'Run TC-6.14 - Cannot-delete branch (archive instead)'
status: Completed
test_id: TC-6.14
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.14: Run TC-6.14 - Cannot-delete branch (archive instead)

## Goal

Run `TC-6.14` from `docs/test-plan/06-partners.md` and record the result.

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
| Run at | 2026-05-09T18:36:30Z |

### Evidence

- Navigated to `/partners/p-seed` ✅
- Mocked `DELETE /api/v1/partners/p-seed` to return HTTP 409 with body `{ message: "Partner has dependent records and cannot be deleted." }` ✅
- Clicked `data-testid="partner-delete-button"` ✅
- Dialog switched to title "Cannot delete" ✅
- Dialog body shows "Partner has dependent records and cannot be deleted." ✅
- `data-testid="confirm-cancel"` (Cancel) button present ✅
- `data-testid="confirm-button"` with text "Archive instead" present ✅
- Clicked "Archive instead" → archive API called ✅

### Note

Backend does not currently enforce deletion restrictions; the 409 response was simulated via route mocking to exercise the cannot-delete UI branch.
