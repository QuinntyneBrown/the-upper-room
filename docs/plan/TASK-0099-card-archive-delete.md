---
id: TASK-0099
title: Card archive + delete
status: Accepted
phase: K
depends_on: [TASK-0094, TASK-0009]
traces_to: [L2-046]
estimated_context: small
---

# TASK-0099: Card archive / delete

## Goal
Archive removes the card from default board view; delete uses danger-confirm dialog.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/kanban/card-archive-delete.spec.ts`

**Scenarios:**
1. Archive card from dialog → card disappears; visible under "Show archived" toggle on board.
2. Delete card with typed-confirm → row gone; audit row recorded.
