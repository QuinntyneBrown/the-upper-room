---
id: TASK-TC-7.6
title: 'Run TC-7.6 - Add card via the column footer'
status: Completed
test_id: TC-7.6
source: ../../test-plan/07-kanban-boards.md
result: BLOCKED
run_at: 2026-05-09T23:18:00Z
---

# TASK-TC-7.6: Run TC-7.6 - Add card via the column footer

## Result: BLOCKED — UI affordance missing (BUG-007)

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 93d089b                     |
| Run at     | 2026-05-09T23:18:00Z        |

### Evidence

Test plan acknowledges current state: `board-view.html` does not render a visible Add Card control.
Per the plan: "Pass criteria: current UI has no Add Card entry point. Mark blocked/failed against
the product requirement if adding cards from the board is required."

Backend `POST /api/v1/boards/{id}/cards` exists, but no UI binds to it from the board view.

Defect: [BUG-007](../../bugs/BUG-007-add-card-button-missing.md).

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
