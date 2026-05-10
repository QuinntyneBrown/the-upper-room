---
id: TASK-TC-8.5
title: 'Run TC-8.5 - Submit a new idea'
status: Completed
test_id: TC-8.5
source: ../../test-plan/08-ideas.md
result: PASS
run_at: 2026-05-10T02:05:00Z
---

# TASK-TC-8.5: Run TC-8.5 - Submit a new idea

## Result: PASS — backend POST endpoint and frontend New Idea form added

| Field      | Value                       |
|------------|-----------------------------|
| Backend    | xUnit (.NET)                |
| Browser    | Chromium (Playwright)       |
| Build SHA  | 13dca32 + new-idea flow     |
| Run at     | 2026-05-10T02:05:00Z        |

### Evidence

Backend ATDD (new this iteration):
- `Post_ideas_creates_draft_and_persists_across_restart` PASS — POST `/api/v1/ideas`
  with `{ title, description }` returns 201 with `{ id, title, status: "Draft", proposedBy }`;
  the idea is retrievable via GET after a factory restart.
- `Post_ideas_with_blank_title_returns_422` PASS — whitespace-only title rejected.

Frontend:
- `idea-list.html` now renders `<button data-testid="idea-new-button">+ New idea</button>` in
  the toolbar.
- Click toggles `<section data-testid="idea-new-form">` with title input, description textarea,
  and Create / Cancel buttons.
- `submitNewIdea()` POSTs `{ title, description }`, prepends the response to the local list,
  and resets the form. Errors surface a snackbar.

End-to-end submission flow now works. [BUG-009](../../bugs/BUG-009-new-idea-button-missing.md)
is resolved.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
