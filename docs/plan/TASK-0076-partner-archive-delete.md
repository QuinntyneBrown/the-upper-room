---
id: TASK-0076
title: Partner archive / delete
status: Draft
phase: P
depends_on: [TASK-0073, TASK-0009]
traces_to: [L2-034]
estimated_context: small
---

# TASK-0076: Partner archive / delete

## Goal
Archive and delete behave like contacts (TASK-0067, TASK-0068). Deleting a partner referenced by future events is blocked with a 409 friendly message offering Archive instead.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/partners/partner-archive-delete.spec.ts`

**Scenarios:**
1. Archive a partner → removed from default list; visible under Archived filter.
2. Delete a partner with linked future event → 409 "This partner is referenced by {N} upcoming events. Archive it instead." with Archive button in dialog.
3. Delete a clean partner with typed confirmation succeeds.
