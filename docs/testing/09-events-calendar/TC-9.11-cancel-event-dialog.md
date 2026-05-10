---
id: TASK-TC-9.11
title: 'Run TC-9.11 - Cancel event dialog'
status: Completed
test_id: TC-9.11
source: ../../test-plan/09-events-calendar.md
result: PASS
run_at: 2026-05-09T23:50:00Z
---

# TASK-TC-9.11: Run TC-9.11 - Cancel event dialog

## Result: PASS

- `cancel-approval.spec.ts:40` — Cancel event shows confirm dialog with optional message field PASS.
- `cancel-approval.spec.ts:61` — Confirming cancel flips status to Cancelled and shows ribbon PASS.

Dialog `[data-testid="event-cancel-dialog"]` opens with title "Cancel event", message textarea
`[data-testid="event-cancel-message"]`, "Keep event" + "Yes, cancel" buttons. Confirming sets
status to Cancelled and renders the cancelled ribbon on the event card.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
