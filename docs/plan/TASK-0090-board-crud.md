---
id: TASK-0090
title: Board CRUD + list page
status: Draft
phase: K
depends_on: [TASK-0033, TASK-0010]
traces_to: [L2-043, L2-044]
estimated_context: medium
---

# TASK-0090: Boards CRUD

## Goal
Persist `KanbanBoard`, `KanbanColumn`, `KanbanSwimlane`, `KanbanCard` with the schemas in L2-043; expose CRUD endpoints; render `/boards` list page with empty state and create wizard ("name", "description", default columns).

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/kanban/board-crud.spec.ts`

**Page Object:** `pages/BoardsListPage.ts`, `components/CreateBoardWizard.ts`.

**Scenarios:**
1. Empty `/boards` shows the prescribed empty state.
2. Create wizard with name "Outreach Q1" + 3 default columns → board appears in list.
3. List card shows last-activity timestamp.
4. Member without `KanbanBoard:Create` does not see the "New board" button.
