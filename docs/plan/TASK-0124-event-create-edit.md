---
id: TASK-0124
title: Event create / edit form
status: Accepted
phase: E
depends_on: [TASK-0120, TASK-0070, TASK-0110]
traces_to: [L2-056]
estimated_context: medium
---

# TASK-0124: Event create / edit

## Goal
Sectioned form: Basics, When (start, end, timezone, all-day, recurrence — None for now), Where (Location autocomplete OR Virtual URL OR both, "TBD" toggle), Who (Capacity, Requires approval, Partners), Tags. Live preview card on MD+.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/events/event-create-edit.spec.ts`

**Page Object:** `pages/EventFormPage.ts`.

**Scenarios:**
1. End < start → field-level error "End time must be after start time."; submit blocked.
2. Pick location from autocomplete → preview card updates with location name.
3. Switch timezone → preview times reflect new TZ but UTC stored value unchanged.
4. Save and reload → values round-trip correctly.
