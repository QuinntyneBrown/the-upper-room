---
id: TASK-TC-2.4
title: 'Run TC-2.4 - Auth callback rejects missing or mismatched state'
status: Completed
test_id: TC-2.4
source: ../../test-plan/02-authentication.md
---

# TASK-TC-2.4: Run TC-2.4 - Auth callback rejects missing or mismatched state

## Goal

Run `TC-2.4` from `docs/test-plan/02-authentication.md` and record the result.

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

- Navigated to `/auth/callback?code=test&state=wrong-state` (no matching PKCE state in sessionStorage)
- Redirected to `/sign-in` ✅
- State mismatch guard works: callback rejects the code when state doesn't match stored `pkce.state`
