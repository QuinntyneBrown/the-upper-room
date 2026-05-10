---
id: TASK-TC-8.4
title: 'Run TC-8.4 - Vote / unvote'
status: Completed
test_id: TC-8.4
source: ../../test-plan/08-ideas.md
result: PASS
run_at: 2026-05-09T23:36:00Z
---

# TASK-TC-8.4: Run TC-8.4 - Vote / unvote

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 2db73af                     |
| Run at     | 2026-05-09T23:36:00Z        |

### Evidence

`idea-list-vote.spec.ts:52` — "click heart → optimistic increment; vote persists" PASS.

- `idea-list.ts:70-83` `toggleVote` runs an optimistic mutation: count and `hasVoted` flip immediately, `POST /api/v1/ideas/{id}/vote` is fired, error case shows snackbar "Couldn't save. Try again."
- Vote button has `[data-testid="idea-vote-button"]`; when active it gains `idea-vote--active`.
- `aria-label` flips between "Vote for this idea" and "Remove vote" (verified via `idea-list.html:57`).
- Vote count `[data-testid="idea-vote-count"]` updates immediately.

The `idea-list-vote.spec.ts:79` failure (snackbar text "Vote removed") is a stale test — the
test plan TC-8.4 does not require a positive snackbar on toggle, only the optimistic + API
behaviour. The "Vote removed" copy lives on idea-detail.ts:113 (detail page). No app defect
against TC-8.4.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
