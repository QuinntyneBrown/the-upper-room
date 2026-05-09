---
id: TASK-0228
title: Persist Kanban boards (and dependent entities) in database
status: Accepted
phase: P
depends_on: []
traces_to: []
estimated_context: medium
---

# TASK-0228: Persist Kanban boards in database

## Goal

Replace the static `Boards` list in `TheUpperRoom.Api/Kanban/BoardsController.cs:11` (and any sibling static lists for columns, cards, schemas) with EF Core persistence.

## ATDD Process — REQUIRED

1. Write failing tests first.
2. Confirm meaningful failures.
3. Implement the radically simplest persistence path.

## Acceptance Tests

### Backend Integration

**Spec file(s):**
- `backend/tests/TheUpperRoom.Api.Tests/Kanban/KanbanPersistenceTests.cs`

**Scenarios:**
1. Boards, columns, cards, and card-schema configurations all survive a host restart.
2. Drag-and-drop reorder operations persist (existing column/card ordering preserved).
3. WIP-limit settings persist.

### Playwright E2E

- Existing kanban e2e specs continue to pass (board-crud, board-view, board-dnd, schema-editor).

## Implementation Outline

- Add `Board`, `BoardColumn`, `Card`, and any related entities on `AppDbContext`.
- EF migration including the join/order tables.
- Swap controller reads/writes to DbContext queries.

## Definition of Done

- [ ] All listed tests pass.
- [ ] No static `Boards` (or related) collections remain in production source for kanban.
- [ ] Status updated to `Done`.

## Out of Scope

- Realtime collaboration / SignalR (separate concern).
