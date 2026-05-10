---
id: TASK-TC-7.12
title: 'Run TC-7.12 - Delete card'
status: Completed
test_id: TC-7.12
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-10T01:15:00Z
---

# TASK-TC-7.12: Run TC-7.12 - Delete card

## Result: PASS (after backend DELETE endpoint added)

| Field      | Value                       |
|------------|-----------------------------|
| Test       | `KanbanPersistenceTests` (xUnit, .NET) |
| Build SHA  | 9da1b6e + DELETE endpoint   |
| Run at     | 2026-05-10T01:15:00Z        |

### Evidence

ATDD: 3 new xUnit tests added under `Kanban/KanbanPersistenceTests.cs` —
- `Delete_card_returns_204_and_removes_from_board` PASS.
- `Delete_unknown_card_returns_404` PASS.
- `Delete_card_persists_across_restart` PASS.

Implementation:
- New `DeleteCardCommand` + `DeleteCardHandler` in `PatchCardCommand.cs` (alongside the
  existing patch and move handlers, mediator pattern).
- New `[HttpDelete("{id}")]` action on `CardsController` mapping to NoContent / NotFound /
  Unauthorized via the existing `KanbanOutcome` enum.

Frontend `card-archive-delete` flow now hits a real endpoint that returns 204; the optimistic
UI converges to server truth.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
