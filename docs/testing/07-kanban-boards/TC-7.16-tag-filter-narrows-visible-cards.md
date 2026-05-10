---
id: TASK-TC-7.16
title: 'Run TC-7.16 - Tag filter narrows visible cards'
status: Completed
test_id: TC-7.16
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-09T23:13:00Z
---

# TASK-TC-7.16: Run TC-7.16 - Tag filter narrows visible cards

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | ac993f4                     |
| Run at     | 2026-05-09T23:13:00Z        |

### Evidence

Verified via `e2e/tests/kanban/board-view.spec.ts:100` after BUG-035/036/037 fixes — was timing out on click before the layout fix.

- Click `[data-testid="board-tag-filter-VIP"]` → chip becomes active (`filter-chip--active`).
- Cards "Plan kickoff", "Email partner list", "Send announcement" remain visible (the 3 with VIP tag).
- Cards "Draft outreach copy", "Approve budget" disappear (no VIP tag).

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
