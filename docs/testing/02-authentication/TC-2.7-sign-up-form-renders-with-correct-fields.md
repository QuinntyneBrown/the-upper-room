---
id: TASK-TC-2.7
title: 'Run TC-2.7 - Sign-up form renders with correct fields'
status: Completed
test_id: TC-2.7
source: ../../test-plan/02-authentication.md
---

# TASK-TC-2.7: Run TC-2.7 - Sign-up form renders with correct fields

## Goal

Run `TC-2.7` from `docs/test-plan/02-authentication.md` and record the result.

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
| Build SHA | ee1af6b |
| Tester | Claude (automated) |
| Run at | 2026-05-09T14:00:00Z |

### Evidence

- Navigated to `/sign-up`
- Heading "Create your account" ✅
- Email field (testId="sign-up-email") ✅
- Password field (testId="sign-up-password") with show-password toggle ✅
- Password strength meter (tar-password-strength) ✅
- City field (testId="sign-up-city") ✅
- Terms checkbox (testId="sign-up-terms") ✅
- Submit button "Create account" (testId="sign-up-submit") ✅
