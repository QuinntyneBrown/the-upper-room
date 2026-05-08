---
id: TASK-0128
title: Event cancellation + approval flow
status: Draft
phase: E
depends_on: [TASK-0123, TASK-0125]
traces_to: [L2-052, L2-055]
estimated_context: small
---

# TASK-0128: Cancel + approval

## Goal
Organizer can cancel event with optional message; cancellation status notifies all RSVPs (TASK-0150 wires email). Approval queue panel for events with `requiresApproval`.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/events/cancel-approval.spec.ts`

**Scenarios:**
1. Cancel event → confirm dialog asks for optional message; status flips to Cancelled; ribbon shown.
2. Notification `event_cancelled` queued for each RSVP (verified via inbox in TASK-0151).
3. Approval queue lists pending RSVPs with Approve/Deny buttons.
