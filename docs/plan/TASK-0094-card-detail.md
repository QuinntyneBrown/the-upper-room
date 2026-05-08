---
id: TASK-0094
title: Card detail dialog
status: Completed
phase: K
depends_on: [TASK-0091]
traces_to: [L2-046]
estimated_context: medium
---

# TASK-0094: Card detail

## Goal
Click a card → dialog (`min(720px, 100vw - 32px)`) with editable title, schema-driven fields, tags, assignee, due date, attachments (max 10 × 10MB), comments (notes scoped to card), activity log. Right-aligned actions Archive / Delete / `more_vert`.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/kanban/card-detail.spec.ts`

**Page Object:** `components/CardDetailDialog.ts`.

**Scenarios:**
1. Click card → dialog opens with the schema-defined fields visible.
2. Clearing a required field then closing → dialog blocks close, inline error.
3. Add a comment via `<tar-notes>` integration.
4. Attach a file (3MB PDF) → appears in attachments list.
5. Inline title edit + blur → persists.
