---
id: TASK-TC-8.8
title: 'Run TC-8.8 - Comments on idea'
status: Completed
test_id: TC-8.8
source: ../../test-plan/08-ideas.md
result: PASS
run_at: 2026-05-10T02:18:00Z
---

# TASK-TC-8.8: Run TC-8.8 - Comments on idea

## Result: PASS — backend endpoints + frontend section shipped

| Field      | Value                       |
|------------|-----------------------------|
| Backend    | xUnit (.NET)                |
| Browser    | Chromium (Playwright)       |
| Build SHA  | 3edb1ef + comments stack    |
| Run at     | 2026-05-10T02:18:00Z        |

### Evidence

Backend ATDD (new this iteration):
- `Post_idea_comment_creates_and_lists_persists_across_restart` PASS — POST creates,
  GET lists in chronological order, both survive a factory restart, and per-author values
  round-trip.
- `Post_comment_with_blank_body_returns_422` PASS.
- `Post_comment_for_unknown_idea_returns_404` PASS.
- `IdeaCommentRow` added to `IdeasDbContext` with PK + IdeaId index.

Frontend:
- `idea-detail.html` now renders a Comments section (`data-testid="idea-comments"`) with the
  list of comments (each `idea-comment-{id}`) and a textarea + Post comment button
  (`idea-comment-input` / `idea-comment-submit`).
- `loadComments()` fetches on init; `submitComment()` POSTs and appends to local state.

End-to-end commenting now works. [BUG-010](../../bugs/BUG-010-idea-comments-missing.md)
is resolved.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
