---
id: TASK-TC-7.11
title: 'Run TC-7.11 - Archive card'
status: Completed
test_id: TC-7.11
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-10T01:25:00Z
---

# TASK-TC-7.11: Run TC-7.11 - Archive card

## Result: PASS (frontend + backend now persisted)

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | b024f43 + Archived backend  |
| Run at     | 2026-05-10T01:25:00Z        |

### Evidence

Frontend: `e2e/tests/kanban/card-archive-delete.spec.ts:28` PASS — open dialog → Archive →
card disappears → Show archived chip reveals it.

Backend (now persisted):
- `CardRow.Archived` (bool) added to `KanbanDbContext`.
- `BoardCardDto.Archived` exposed on the board detail response.
- `PatchCardHandler` accepts `{ "archived": true|false }` (handles bool, JsonElement, string).

ATDD via xUnit:
- `Patch_archived_true_persists_archived_flag_across_restart` PASS — archive survives
  factory restart (hard reload).
- `Patch_archived_false_unarchives_card` PASS — toggle off works.

Optimistic UI now converges to server truth on reload.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
