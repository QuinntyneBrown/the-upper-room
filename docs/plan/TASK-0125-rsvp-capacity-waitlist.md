---
id: TASK-0125
title: RSVP + capacity + waitlist
status: Accepted
phase: E
depends_on: [TASK-0123]
traces_to: [L2-052, L2-055]
estimated_context: medium
---

# TASK-0125: RSVP

## Goal
Segmented "Yes / Maybe / No" RSVP. When `Yes` exceeds capacity, user enters Waitlist with snackbar "You're on the waitlist (#N)". Approval-required events show "Pending approval" until organizer confirms.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/events/rsvp.spec.ts`

**Scenarios:**
1. RSVP Yes on event with available capacity → status "Going" persisted.
2. RSVP Yes on full event (capacity 10, 10 yes) → snackbar "You're on the waitlist (#1)".
3. Approval-required event → after RSVP Yes, snackbar "RSVP submitted. The organizer will confirm shortly.".
4. Organizer can approve/deny pending RSVPs from a side panel.
5. When a confirmed Yes cancels, the next waitlisted user is auto-promoted.
