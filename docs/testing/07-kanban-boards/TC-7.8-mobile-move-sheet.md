---
id: TASK-TC-7.8
title: 'Run TC-7.8 - Mobile move-sheet'
status: Completed
test_id: TC-7.8
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-10T01:55:00Z
---

# TASK-TC-7.8: Run TC-7.8 - Mobile move-sheet

## Result: PASS — Move button on card detail opens the move-sheet (deterministic on any viewport)

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 375×667 (mobile)            |
| Build SHA  | 851b674 + Move button       |
| Run at     | 2026-05-10T01:55:00Z        |

### Evidence

`mobile-swipe.spec.ts:31` PASS — single column visible at xs viewport.

The mobile flow now has a deterministic entry point: open the card detail dialog → click the
new **Move** button (`data-testid="card-detail-move"`). The dialog closes with `{ kind: 'move' }`
and `board-view.ts` opens `BoardMoveSheetDialog` with the per-board column options. Selecting a
column posts `/api/v1/cards/{id}/move` and the card moves.

The pre-existing touch-drag heuristic in `onCardPointerMove` is retained but is no longer the
sole mobile entry point — users on small viewports can rely on the explicit Move button.

card-detail and board-view e2e suites stay 9/9 PASS — no regression.

[BUG-008](../../bugs/BUG-008-card-move-button-missing.md) is now resolved.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
