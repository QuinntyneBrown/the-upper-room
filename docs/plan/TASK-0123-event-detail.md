---
id: TASK-0123
title: Event detail page
status: Accepted
phase: E
depends_on: [TASK-0120]
traces_to: [L2-055]
estimated_context: medium
---

# TASK-0123: Event detail

## Goal
`/events/:id` hero (cover image with gradient + status chip + share icon), two-column on MD+ (left: description/location/partners/comments; right: date-time card, RSVP card, attendees grid, "Add to calendar" button).

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/events/event-detail.spec.ts`

**Page Object:** `pages/EventDetailPage.ts`.

**Scenarios:**
1. Status chip "Scheduled" with appropriate color.
2. Attendees grid renders avatars; clicking expands full list dialog.
3. "Add to calendar" downloads valid `.ics` (TASK-0126).
4. Share button copies URL (TASK-0176).
