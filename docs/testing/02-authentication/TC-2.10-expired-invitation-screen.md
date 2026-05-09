---
id: TASK-TC-2.10
title: 'Run TC-2.10 - Expired invitation screen'
status: Completed
test_id: TC-2.10
source: ../../test-plan/02-authentication.md
---

# TASK-TC-2.10: Run TC-2.10 - Expired invitation screen

## Goal

Run `TC-2.10` from `docs/test-plan/02-authentication.md` and record the result.

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
| Result | **FAIL → Fixed** |
| Browser | Chromium (Playwright) |
| Viewport | 1280×720 |
| Build SHA | ee1af6b |
| Tester | Claude (automated) |
| Run at | 2026-05-09T15:21:00Z |
| Defect | [BUG-016](../../bugs/BUG-016-expired-invitation-shows-error-snackbar.md) |

### Evidence

Stubbed `GET /api/v1/invitations?token=expired-token` → 404.

- `data-testid="invitation-expired"` rendered ✅
- Heading "This invitation has expired." present ✅
- `data-testid="invitation-request-new"` link routes to `/sign-in` ✅
- **FAIL**: `tar-snackbar` also appeared with "We couldn't find what you're looking for." ❌

### Fix

Added `SKIP_ERROR_SNACKBAR` context token to invitation lookup HTTP call in `sign-up.ts`
so the global error interceptor skips the snackbar. The component handles the 404 gracefully
by rendering the expired branch. See BUG-016.
