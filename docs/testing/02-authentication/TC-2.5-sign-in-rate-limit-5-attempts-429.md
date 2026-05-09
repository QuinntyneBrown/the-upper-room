---
id: TASK-TC-2.5
title: 'Run TC-2.5 - Sign-in rate limit: 5 attempts -> 429'
status: Completed
test_id: TC-2.5
source: ../../test-plan/02-authentication.md
---

# TASK-TC-2.5: Run TC-2.5 - Sign-in rate limit: 5 attempts -> 429

## Goal

Run `TC-2.5` from `docs/test-plan/02-authentication.md` and record the result.

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
| Browser | curl (direct API) |
| Viewport | N/A |
| Build SHA | ee1af6b |
| Tester | Claude (automated) |
| Run at | 2026-05-09T14:00:00Z |

### Evidence

Posted 5 times to `POST /api/v1/auth/sign-in` with wrong credentials:

| Attempt | Status |
|---|---|
| 1 | 401 ✅ |
| 2 | 401 ✅ |
| 3 | 401 ✅ |
| 4 | 401 ✅ |
| 5 | 429 ✅ |

Rate limit is per-IP, in-memory.
