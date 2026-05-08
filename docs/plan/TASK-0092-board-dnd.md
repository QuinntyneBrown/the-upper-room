---
id: TASK-0092
title: Drag-and-drop cards across columns
status: Completed
phase: K
depends_on: [TASK-0091]
traces_to: [L2-045]
estimated_context: medium
---

# TASK-0092: Drag-and-drop

## Goal
CDK drag-and-drop between columns; dragged card has `level3` shadow, opacity `0.95`, scale `1.02`; drop persists via `POST /api/v1/cards/{id}/move`; refresh preserves position.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/kanban/board-dnd.spec.ts`

**Page Object:** Extend `BoardViewPage` with `dragCardTo(cardTitle, targetColumn)`.

**Scenarios:**
1. Drag card "Call sponsor" from "To Do" to "In Progress" → card persists in new column after reload.
2. The order within the destination column is preserved.
3. Audit row recorded with action `KanbanCard.Move`.

## Definition of Done
- [ ] Optimistic move; on 5xx revert + snackbar (TASK-0172 generalizes).
