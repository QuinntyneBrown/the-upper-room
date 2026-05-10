---
id: TASK-TC-7.6
title: 'Run TC-7.6 - Add card via the column footer'
status: Completed
test_id: TC-7.6
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-10T01:45:00Z
---

# TASK-TC-7.6: Run TC-7.6 - Add card via the column footer

## Result: PASS — UI affordance now present

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 0357a84 + add-card UI       |
| Run at     | 2026-05-10T01:45:00Z        |

### Evidence

Frontend now renders an Add Card affordance in each column footer:

- Idle state: `<button data-testid="board-column-add-card-{name}">+ Add card</button>`.
- On click, the button is replaced with:
  - `<input data-testid="board-column-add-card-input-{name}" placeholder="Card title">`
    (Enter submits, Esc cancels).
  - `<button data-testid="board-column-add-card-submit-{name}">Add</button>`.
  - `<button data-testid="board-column-add-card-cancel-{name}">Cancel</button>`.

Behaviour wires `submitAddCard()` to `POST /api/v1/boards/{id}/cards { title, columnId }`,
prepends the new card to local state, and resets the input. Failures surface a snackbar.

Backend coverage is the existing `Boards_columns_and_cards_survive_restart` xUnit which
exercises the same POST.

board-view e2e suite still 4/4 PASS — no regression.

[BUG-007](../../bugs/BUG-007-add-card-button-missing.md) is now resolved.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
