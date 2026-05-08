---
id: TASK-0093
title: WIP limits enforced visually + on backend
status: Draft
phase: K
depends_on: [TASK-0092]
traces_to: [L2-043, L2-045]
estimated_context: small
---

# TASK-0093: WIP limits

## Goal
Per-column WIP limit; UI shows count vs. limit; over-limit drop is rejected; invalid drop zones get `--md-sys-color-error-container`.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/kanban/wip-limits.spec.ts`

**Scenarios:**
1. Column with `wipLimit=3` and 3 cards → 4th drop is rejected with snackbar "WIP limit reached for In Progress".
2. While dragging, the over-limit column highlights error-container.
3. Removing one card unlocks subsequent drops.
