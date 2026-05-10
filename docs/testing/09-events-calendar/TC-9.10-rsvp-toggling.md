---
id: TASK-TC-9.10
title: 'Run TC-9.10 - RSVP toggling'
status: Completed
test_id: TC-9.10
source: ../../test-plan/09-events-calendar.md
result: PARTIAL
run_at: 2026-05-09T23:50:00Z
---

# TASK-TC-9.10: Run TC-9.10 - RSVP toggling

## Result: PARTIAL — happy-path Going PASSes; waitlist / pending / cancel snackbars FAIL

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 8350cdc                     |
| Run at     | 2026-05-09T23:50:00Z        |

### Evidence

PASS:
- `rsvp.spec.ts:40` — RSVP Yes on event with available capacity shows Going status.

FAIL (snackbar copy or unmocked endpoint causing error snackbar):
- `rsvp.spec.ts:63` — RSVP Yes on full event shows waitlist snackbar.
- `rsvp.spec.ts:86` — approval-required RSVP Yes shows pending approval snackbar.
- `rsvp.spec.ts:109` — organizer can approve pending RSVP from side panel.
- `rsvp.spec.ts:136` — cancelling RSVP from Going shows waitlist promotion snackbar.

The basic RSVP toggle works end-to-end. The 4 failures all show the generic "Something went
wrong on our end." error snackbar, which means the related backend endpoints
(`/rsvp/approve`, waitlist promotion notifications, etc.) are returning errors and the
component is not surfacing the prescribed copy. To file as follow-up bug.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
