---
id: TASK-TC-2.9
title: 'Run TC-2.9 - Accept-invitation route pre-fills email and city read-only'
status: Completed
test_id: TC-2.9
source: ../../test-plan/02-authentication.md
---

# TASK-TC-2.9: Run TC-2.9 - Accept-invitation route pre-fills email and city read-only

## Goal

Run `TC-2.9` from `docs/test-plan/02-authentication.md` and record the result.

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

Stubbed `GET /api/v1/invitations?token=test-token-123` → `{ "email": "invited@example.com", "city": "Toronto" }`.

- Route `/invitations/accept?token=test-token-123` renders the `SignUp` component ✅
- Heading "Create your account" present ✅
- `data-testid="sign-up-email"` pre-filled with `invited@example.com`, `readOnly=true` ✅
- `data-testid="sign-up-city"` pre-filled with `Toronto`, `readOnly=true` ✅
- `data-testid="sign-up-sign-in-link"` not present in DOM (hidden in invitation mode) ✅

Backend note: `GET /api/v1/invitations` not implemented; tested via route stub as documented.
