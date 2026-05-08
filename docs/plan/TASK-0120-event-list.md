---
id: TASK-0120
title: Event data model + API + list page
status: Draft
phase: E
depends_on: [TASK-0033, TASK-0070, TASK-0110]
traces_to: [L2-052, L2-053]
estimated_context: medium
---

# TASK-0120: Events list

## Goal
Persist Event with all L2-052 fields. Render `/events` with list/calendar toggle (default List on XS, Calendar on MD+). Cards show cover, status chip per L2-053, date+time (locale + TZ abbrev), location/virtual indicator, RSVP count + capacity. Filters: Status, Tag, Partner, Date range, "My events".

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/events/event-list.spec.ts`

**Page Object:** `pages/EventsListPage.ts`.

**Scenarios:**
1. Empty list shows event-icon empty state.
2. Cancelled event card has top error-container ribbon and strikethrough title.
3. Filter "Status=Scheduled" hides past/cancelled events.
4. Toggle to Calendar at MD+ swaps to month view (TASK-0121).
