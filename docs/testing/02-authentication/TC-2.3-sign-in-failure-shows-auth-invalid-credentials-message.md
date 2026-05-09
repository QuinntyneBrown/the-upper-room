---
id: TASK-TC-2.3
title: 'Run TC-2.3 - Auth callback exchanges code and stores token'
status: Completed
test_id: TC-2.3
source: ../../test-plan/02-authentication.md
---

# TASK-TC-2.3: Run TC-2.3 - Auth callback exchanges code and stores token

## Goal

Run `TC-2.3` from `docs/test-plan/02-authentication.md` and record the result.

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
| Run at | 2026-05-09T16:00:00Z |

### Evidence

Seeded `sessionStorage.pkce.state = 'tc23-state'` and `pkce.verifier = 'tc23-verifier-abc123'`.
Stubbed `POST /api/v1/auth/exchange` → 200 `{ "accessToken": "test-token-for-tc2-3" }`.
Navigated to `/auth/callback?code=auth-code-for-tc23&state=tc23-state`.

- Exchange request body: `{"code":"auth-code-for-tc23","codeVerifier":"tc23-verifier-abc123"}` ✅
- Browser navigated to `/dashboard` ✅
- `localStorage` is empty — access token is NOT stored in localStorage ✅

Backend note: Live exchange contract expects `expectedChallenge`; stub used for UI test as documented.
