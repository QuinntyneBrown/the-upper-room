---
id: TASK-0095
title: Column configuration (rename / reorder / color)
status: Draft
phase: K
depends_on: [TASK-0090]
traces_to: [L2-047]
estimated_context: small
---

# TASK-0095: Column config

## Goal
`/boards/:id/configure` lets CityLead+ edit columns: rename, reorder via drag handle, change color (12 M3 chip colors), set/remove WIP limit, add/remove columns. Removing a column with cards prompts a "Move N cards to..." selector.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/kanban/column-config.spec.ts`

**Page Object:** `pages/BoardConfigurePage.ts`.

**Scenarios:**
1. Reorder columns via drag → persists; board view reflects the new order.
2. Remove column with cards → "Move N cards to..." dialog shown; on confirm, cards moved to selected column.
3. Member without `KanbanBoard:Configure` is redirected to `/forbidden`.
