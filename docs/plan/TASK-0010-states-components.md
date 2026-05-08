---
id: TASK-0010
title: Empty / Loading / Skeleton / List-error state components
status: Completed
phase: F
depends_on: [TASK-0002]
traces_to: [L2-103, L2-104, L2-105]
estimated_context: small
---

# TASK-0010: List/page states

## Goal
Reusable `<tar-empty-state>`, `<tar-skeleton>`, `<tar-list-error>` components used by every list and detail page.

## ATDD Process — REQUIRED

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/states.spec.ts`

**Page Object:** Extend `StyleguidePage` with `emptyDemo()`, `skeletonDemo()`, `errorDemo()`.

**Scenarios:**
1. Empty state shows icon (size `xl`), heading (`headline-small`), body (`body-medium` width-capped to 360px), optional primary action.
2. Skeleton renders N rectangles whose total height matches the final list height ± 4px (CLS contribution measured via `LayoutShift` perf entries ≤ 0.01).
3. Skeleton shimmer is disabled under `prefers-reduced-motion`.
4. List error renders with icon `error_outline`, heading "We couldn't load this", body containing the correlation id, and a "Try again" button that re-fires a callback.

## Implementation Outline
- `projects/components/src/lib/states/`.
- Skeleton uses CSS `@keyframes` linear shimmer 1.4s; honors `prefers-reduced-motion: reduce`.

## Definition of Done
- [ ] All scenarios green; CLS metric verified.
