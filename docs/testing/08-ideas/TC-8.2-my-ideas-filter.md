---
id: TASK-TC-8.2
title: 'Run TC-8.2 - My-ideas filter'
status: Completed
test_id: TC-8.2
source: ../../test-plan/08-ideas.md
result: PASS
run_at: 2026-05-09T23:35:00Z
---

# TASK-TC-8.2: Run TC-8.2 - My-ideas filter

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 2db73af                     |
| Run at     | 2026-05-09T23:35:00Z        |

### Evidence

`idea-list-vote.spec.ts:100` — "filter 'My ideas' shows only current user ideas" PASS.

- Click `[data-testid="idea-filter-my-ideas"]` → chip becomes `filter-chip--active`.
- `GET /api/v1/ideas?myIdeas=true` is fired (verified via test route capturing query string).
- Card list filters down to ideas authored by the current user.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
