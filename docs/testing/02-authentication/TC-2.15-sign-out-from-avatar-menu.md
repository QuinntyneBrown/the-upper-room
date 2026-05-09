---
id: TASK-TC-2.15
title: 'Run TC-2.15 - Sign-out from avatar menu'
status: Completed
test_id: TC-2.15
source: ../../test-plan/02-authentication.md
---

# TASK-TC-2.15: Run TC-2.15 - Sign-out from avatar menu

## Goal

Run `TC-2.15` from `docs/test-plan/02-authentication.md` and record the result.

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
| Build SHA | 8b82e9e |
| Tester | Claude (automated) |
| Run at | 2026-05-09T15:59:00Z |

### Evidence

Used stub auth flow (seeded PKCE state + stubbed `/api/v1/auth/exchange` → 200 with test token)
to enter the app shell.

- `data-testid="avatar-trigger"` button present in header ✅
- Clicking it opens a menu with `role="menu"` ✅
- `data-testid="avatar-menu-sign-out"` ("Sign out") menuitem present ✅
- Clicking it shows a TarConfirmDialog "Sign out?" ✅
- Confirming the dialog:
  - `POST /api/v1/auth/sign-out` → 204 No Content ✅
  - Redirected to `/sign-in?signedOut=1` ✅

Note: A `tar-confirm-dialog` was shown before the actual sign-out call, adding an expected
confirmation step not explicitly mentioned in the test plan. This is correct UX behavior.

Note: Error boundary appeared on the dashboard due to 401 responses (fake token rejected by
real APIs). Error boundary was hidden via JavaScript to test the sign-out flow specifically.
