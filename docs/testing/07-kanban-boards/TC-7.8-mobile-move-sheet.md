---
id: TASK-TC-7.8
title: 'Run TC-7.8 - Mobile move-sheet'
status: Completed
test_id: TC-7.8
source: ../../test-plan/07-kanban-boards.md
result: PARTIAL
run_at: 2026-05-09T23:18:00Z
---

# TASK-TC-7.8: Run TC-7.8 - Mobile move-sheet

## Result: PARTIAL — column-pagination passes; touch-drag → sheet flow still failing

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 375×667 (mobile)            |
| Build SHA  | 93d089b                     |
| Run at     | 2026-05-09T23:18:00Z        |

### Evidence

- `mobile-swipe.spec.ts:31` PASS — at 375px viewport only one column visible at a time; scroll moves to next.
- `mobile-swipe.spec.ts:53` FAIL — dot indicators reflect current column index.
- `mobile-swipe.spec.ts:75` FAIL — touch drag on card opens Move-to sheet instead of HTML5 drag.

Card-detail-dialog has no Move button (per BUG-008). The mobile move sheet (`<div data-testid="board-move-sheet">`) is present in `board-view.html:157` markup but the touch interaction
that opens it does not appear to fire in the current build. To file as follow-up after BUG-008
adjacency review.

Defect: [BUG-008](../../bugs/BUG-008-card-move-button-missing.md).

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
