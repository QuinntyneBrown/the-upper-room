---
id: TASK-TC-7.5
title: 'Run TC-7.5 - Columns view renders cards'
status: Completed
test_id: TC-7.5
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-09T22:55:00Z
---

# TASK-TC-7.5: Run TC-7.5 - Columns view renders cards

## Goal

Run `TC-7.5` from `docs/test-plan/07-kanban-boards.md` and record the result.

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 205dd5e                     |
| Run at     | 2026-05-09T22:55:00Z        |
| Tester     | Claude (automated)          |

### Evidence

Verified via `e2e/tests/kanban/board-view.spec.ts:65` (board with 4 columns + 8 cards renders all elements) — PASS after BUG-035 + BUG-036 fixes.

- Columns container `[data-testid="board-view-columns"]` present.
- Each column `[data-testid="board-column-{name}"]` rendered (Backlog, In Progress, Review, Done).
- Each card `[data-testid="board-card-{title}"]` rendered (8 cards across 4 columns).
- Cards have title, tag chips, assignee initials, due date when available.
- `board-view.spec.ts:78` (each card shows title, up to 2 tag chips, assignee avatar, due date) also PASS.
- `board-view.spec.ts:89` (at MD+ columns are horizontally scrollable) also PASS.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
