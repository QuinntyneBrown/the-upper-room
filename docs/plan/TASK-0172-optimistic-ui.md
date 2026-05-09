---
id: TASK-0172
title: Optimistic UI patterns generalized
status: Completed
phase: X
depends_on: [TASK-0008, TASK-0092, TASK-0100]
traces_to: [L2-114]
estimated_context: small
---

# TASK-0172: Optimistic UI

## Goal
Generalize an `optimisticMutation()` helper that wraps any toggle action (vote, RSVP, archive, kanban move). On 5xx the helper reverts the local state and shows snackbar "Couldn't save. Try again.".

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/cross-cutting/optimistic-ui.spec.ts`

**Scenarios:**
1. Vote on idea: API stub 500 → heart reverts to unfilled within 500ms; snackbar visible.
2. RSVP: API 500 → segmented selection reverts; snackbar visible.
3. Kanban move: API 500 → card returns to source column.

## Definition of Done
- [ ] Helper exposed in `components` library.
