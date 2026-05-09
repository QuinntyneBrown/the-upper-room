---
id: TASK-0121
title: Calendar Month view
status: Done
phase: E
depends_on: [TASK-0120]
traces_to: [L2-054]
estimated_context: medium
---

# TASK-0121: Calendar — Month view

## Goal
`mat`-style 7-column month grid; cells `min-height: 120px` MD+, `80px` XS; up to 3 events per cell with "+N more" popover; today highlighted with secondary container; selected day outlined `2px primary`.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/events/calendar-month.spec.ts`

**Page Object:** `components/CalendarMonth.ts`.

**Scenarios:**
1. With current date Mar 2026, today's cell is highlighted.
2. Click a day → cell receives selected outline; clicking "+2 more" opens popover with the day's events.
3. Navigate to next month via the chevron — events for that month load.
4. Click "Today" while on Apr → returns to current month with today selected.
