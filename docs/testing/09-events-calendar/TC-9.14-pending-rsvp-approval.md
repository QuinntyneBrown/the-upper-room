---
id: TASK-TC-9.14
title: 'Run TC-9.14 - Pending RSVP approval'
status: Completed
test_id: TC-9.14
source: ../../test-plan/09-events-calendar.md
result: PARTIAL
run_at: 2026-05-09T23:55:00Z
---

# TASK-TC-9.14: Run TC-9.14 - Pending RSVP approval

## Result: PARTIAL — UI panel renders; approve action surfaces error snackbar in tests

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 1651f5b                     |
| Run at     | 2026-05-09T23:55:00Z        |

### Evidence

PASS:
- `cancel-approval.spec.ts:93` — Approval queue shows pending RSVPs with Approve and Deny buttons.

FAIL:
- `rsvp.spec.ts:109` — organizer can approve pending RSVP from side panel — likely missing
  mock for the approval endpoint (same pattern as the other rsvp.spec.ts:* failures).

`[data-testid="rsvp-panel"]` and per-row Approve/Deny buttons render correctly per source review
of `event-detail.html:111`. Persistence of approval state could not be verified end-to-end via
the existing spec because of the unmocked endpoint surfacing the generic error snackbar.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
