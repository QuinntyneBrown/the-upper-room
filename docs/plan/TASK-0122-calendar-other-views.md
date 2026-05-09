---
id: TASK-0122
title: Calendar Week / Day / Agenda views
status: Done
phase: E
depends_on: [TASK-0121]
traces_to: [L2-054]
estimated_context: medium
---

# TASK-0122: Calendar — Week / Day / Agenda

## Goal
Segmented buttons toggle between Month/Week/Day/Agenda. Week and Day show hour rows 06:00-23:00 with drag-to-create. Agenda shows chronological list.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/events/calendar-views.spec.ts`

**Scenarios:**
1. Switch to Week → 7-column grid with hour rows.
2. Drag a range in Day view → opens the Event create form pre-filled with start/end (TASK-0124 wiring).
3. Agenda view lists events in order with date headers.
4. Each view persists last-used in user preferences.
