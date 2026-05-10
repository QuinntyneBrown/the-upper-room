---
id: TASK-TC-7.7
title: 'Run TC-7.7 - Drag-and-drop a card between columns'
status: Completed
test_id: TC-7.7
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-09T23:13:00Z
---

# TASK-TC-7.7: Run TC-7.7 - Drag-and-drop a card between columns

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | ac993f4                     |
| Run at     | 2026-05-09T23:13:00Z        |

### Evidence

Verified via three e2e tests in `e2e/tests/kanban/board-dnd.spec.ts`, all PASS after BUG-035/036/037 fixes:

- `:88` — drag "Call sponsor" from "To Do" to "In Progress" persists after reload (cards have `draggable="true"`, columns handle drop, optimistic move + reload still shows card in destination).
- `:104` — order within destination column is preserved after reload.
- `:118` — move POST is fired with action context for audit (`POST /api/v1/cards/{id}/move` with `{ targetColumnId }` plus action context headers).

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
