---
id: TASK-0098
title: Mobile swipeable columns (XS)
status: Draft
phase: K
depends_on: [TASK-0091]
traces_to: [L2-045]
estimated_context: small
---

# TASK-0098: Mobile swipe

## Goal
At XS, columns become full-width snap-paginated, one visible at a time, with dot indicators below.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/kanban/mobile-swipe.spec.ts`

**Scenarios:**
1. At 375px viewport, only one column visible; swipe (touch) moves to next.
2. Dot indicators reflect the current column index.
3. Drag-and-drop on touch devices opens a "Move to..." sheet rather than across-screen drag (touch UX).
