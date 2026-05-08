---
id: TASK-0096
title: Card schema editor
status: Draft
phase: K
depends_on: [TASK-0090, TASK-0094]
traces_to: [L2-047]
estimated_context: medium
---

# TASK-0096: Card schema editor

## Goal
Edit the board's card schema: add/remove/reorder/edit fields with types `text`, `textarea`, `number`, `date`, `select`, `tags`, `assignee`, `url`, `partnerRef`. Removing a required field with data warns of count.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/kanban/schema-editor.spec.ts`

**Page Object:** `components/CardSchemaEditor.ts`.

**Scenarios:**
1. Add a `select` field "Priority" with options [Low, Med, High] → card detail dialog shows it.
2. Remove a required field with data on N cards → confirmation "Removing this field will erase data on N cards. Continue?".
3. Reorder fields → card dialogs reflect new order.
