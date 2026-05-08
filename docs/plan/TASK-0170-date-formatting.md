---
id: TASK-0170
title: Date / number formatting (en-CA) + relative time
status: Draft
phase: X
depends_on: [TASK-0013]
traces_to: [L2-110]
estimated_context: small
---

# TASK-0170: Date/number formatting

## Goal
Locale-aware formatting via Angular `DatePipe` (en-CA) + a `<tar-relative-time>` component using thresholds (just now / Nm / Nh / Nd / absolute).

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/cross-cutting/date-formatting.spec.ts`

**Scenarios:**
1. A timestamp 5 minutes ago renders "5m ago".
2. 3 days ago renders "3d ago".
3. 8 days ago renders "Mar 5, 2026" (locale-aware long-medium format).
4. Numbers render with `,` thousands separator.

## Definition of Done
- [ ] Component re-renders every minute for live updates.
