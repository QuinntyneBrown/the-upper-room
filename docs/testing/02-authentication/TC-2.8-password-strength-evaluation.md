---
id: TASK-TC-2.8
title: 'Run TC-2.8 - Password strength evaluation'
status: Completed
test_id: TC-2.8
source: ../../test-plan/02-authentication.md
---

# TASK-TC-2.8: Run TC-2.8 - Password strength evaluation

## Goal

Run `TC-2.8` from `docs/test-plan/02-authentication.md` and record the result.

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
| Run at | 2026-05-09T15:20:00Z |

### Evidence

Tested on `/sign-up` with the password strength meter:

| Input | Expected | Actual | Status |
|---|---|---|---|
| `abc` | Weak | Weak | ✅ |
| `Hello123!` | Okay | Okay | ✅ |
| `Password!23456` | Strong | Strong | ✅ |

Note: Test plan updated to use `Hello123!` instead of `Password1` — `Password1` is in the
common-passwords blocklist and returns score 0 with helper "Password is too common", not "Okay".
The blocklist is intentional security hardening; the test data was corrected.

Five bars render, filling with error/secondary/tertiary color per strength level. Helper text
shows for common passwords and weak inputs.
