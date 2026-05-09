---
id: TASK-0127
title: Event recurrence
status: Done
phase: E
depends_on: [TASK-0124]
traces_to: [L2-056]
estimated_context: medium
---

# TASK-0127: Event recurrence

## Goal
Recurrence: None / Daily / Weekly / Monthly / Custom (RRULE). Editing one occurrence vs the series prompts the user.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/events/recurrence.spec.ts`

**Scenarios:**
1. Create weekly recurrence on Mondays → calendar shows event every Monday for 12 weeks (default horizon).
2. Edit one occurrence → dialog "This event only / This and following / Entire series".
3. Cancel a single occurrence → only that date is cancelled; rest remain.
4. Series spans daylight-savings boundary correctly (no time drift).
