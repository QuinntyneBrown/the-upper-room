---
id: TASK-TC-2.2
title: 'Run TC-2.2 - Sign-in submit starts PKCE authorization'
status: Completed
test_id: TC-2.2
source: ../../test-plan/02-authentication.md
---

# TASK-TC-2.2: Run TC-2.2 - Sign-in submit starts PKCE authorization

## Goal

Run `TC-2.2` from `docs/test-plan/02-authentication.md` and record the result.

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

- Routed `/__idp/authorize**` to intercept redirect
- Entered test email and password, clicked Sign in
- `sessionStorage.pkce.verifier`, `pkce.state`, `pkce.nonce` all set ✅
- Redirect URL: `/__idp/authorize?response_type=code&code_challenge_method=S256&code_challenge=...&state=...&nonce=...&client_id=the-upper-room&redirect_uri=http://localhost:4200/auth/callback` ✅
- No password sent to `/api/v1/auth/sign-in` from UI path ✅
