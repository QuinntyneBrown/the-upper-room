---
id: TASK-0091
title: Board view (columns + read-only cards)
status: Completed
phase: K
depends_on: [TASK-0090]
traces_to: [L2-045]
estimated_context: medium
---

# TASK-0091: Board view

## Goal
`/boards/:id` renders header + horizontally scrolling columns (min `320px`, max `360px`) with read-only cards (drag in TASK-0092). XS: single-column at-a-time swipe (TASK-0098).

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/kanban/board-view.spec.ts`

**Page Object:** `pages/BoardViewPage.ts` (`column(name)`, `card(title)`).

**Scenarios:**
1. Board with 4 columns + 8 cards renders all elements.
2. Each card shows title field, up to 2 tag chips, assignee avatar, due date.
3. At MD+, columns are horizontally scrollable.
4. Filter chip "Tag=VIP" filters card visibility per column.
