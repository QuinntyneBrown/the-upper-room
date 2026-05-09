---
id: TASK-TC-2.13
title: 'Run TC-2.13 - Reset-password page'
status: Completed
test_id: TC-2.13
source: ../../test-plan/02-authentication.md
---

# TASK-TC-2.13: Run TC-2.13 - Reset-password page

## Goal

Run `TC-2.13` from `docs/test-plan/02-authentication.md` and record the result.

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
| Build SHA | a1a6dc3 |
| Tester | Claude (automated) |
| Run at | 2026-05-09T15:34:00Z |

### Evidence

- Navigated to `/reset-password?token=valid` ✅
- Heading "Reset password" ✅
- `data-testid="reset-new-password"` present ✅
- `data-testid="reset-confirm-password"` present ✅
- `data-testid="reset-submit"` present ✅

Backend note: `POST /api/v1/auth/reset-password` not implemented; backend integration blocked as documented.
