---
id: TASK-TC-7.12
title: 'Run TC-7.12 - Delete card'
status: Completed
test_id: TC-7.12
source: ../../test-plan/07-kanban-boards.md
result: BLOCKED
run_at: 2026-05-09T23:18:00Z
---

# TASK-TC-7.12: Run TC-7.12 - Delete card

## Result: BLOCKED — backend DELETE endpoint missing

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 93d089b                     |
| Run at     | 2026-05-09T23:18:00Z        |

### Evidence

`card-archive-delete.spec.ts:64` ("delete card with typed-confirm → card removed and snackbar shown") FAILS.

Per the test plan: "current backend has no `DELETE /api/v1/cards/{id}` endpoint in
`CardsController`" and "current frontend calls `DELETE /api/v1/cards/{id}` after removing the
card optimistically." So the optimistic UI removes the card, but the backend returns 404 and the
snackbar shows error rather than success.

Severity: Critical (per test plan).

This is the same backend gap previously noted in the test plan; no separate bug filed.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
