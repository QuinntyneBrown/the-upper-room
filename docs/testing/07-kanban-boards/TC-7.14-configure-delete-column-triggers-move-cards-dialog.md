---
id: TASK-TC-7.14
title: 'Run TC-7.14 - Configure: delete column triggers move-cards dialog'
status: Completed
test_id: TC-7.14
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-09T23:15:00Z
---

# TASK-TC-7.14: Run TC-7.14 - Configure: delete column triggers move-cards dialog

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | ac993f4                     |
| Run at     | 2026-05-09T23:15:00Z        |

### Evidence

- `column-config.spec.ts:86` — "remove column with cards prompts move dialog and confirms move" PASS.
- `board-configure-material.spec.ts:52` — "move cards dialog appears as a Material card when column with cards is deleted" PASS.
- `:60` move cards target select wrapped in Material form field — PASS.
- `:68` confirm button is Material flat button — PASS.

Dialog `[data-testid="config-move-cards-dialog"]` opens with title `Move {n} cards from "{name}" to...`, target select lists other columns, Confirm moves cards and removes the source column.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
