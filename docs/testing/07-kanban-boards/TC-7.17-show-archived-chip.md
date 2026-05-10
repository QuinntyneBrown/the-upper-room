---
id: TASK-TC-7.17
title: 'Run TC-7.17 - Show archived chip'
status: Completed
test_id: TC-7.17
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-09T23:18:00Z
---

# TASK-TC-7.17: Run TC-7.17 - Show archived chip

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 93d089b                     |
| Run at     | 2026-05-09T23:18:00Z        |

### Evidence

Verified within `card-archive-delete.spec.ts:28` ("archive card → disappears from board; visible
under Show archived toggle") which PASSES end-to-end after BUG-035/036/037.

- `[data-testid="board-show-archived"]` chip rendered in toolbar (board-view.html).
- After archiving a card, toggling Show archived re-displays the archived card in the board view
  with its archived styling.
- Toggling off hides archived cards again — state toggles correctly.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
