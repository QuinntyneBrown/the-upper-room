---
id: TASK-0097
title: Swimlanes
status: Completed
phase: K
depends_on: [TASK-0091]
traces_to: [L2-043]
estimated_context: small
---

# TASK-0097: Swimlanes

## Goal
Optional swimlanes by Assignee or Priority; configurable on the board; each lane renders as a horizontal band across all columns.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/kanban/swimlanes.spec.ts`

**Scenarios:**
1. Configure board with swimlanes by Assignee (3 users) → 3 horizontal bands.
2. Drag card across lanes updates the card's `swimlaneKey` (assignee or priority).
3. Disable swimlanes → bands collapse back to a flat list.
