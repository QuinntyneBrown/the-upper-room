---
id: TASK-TC-9.7
title: 'Run TC-9.7 - Validation: end time before start'
status: Completed
test_id: TC-9.7
source: ../../test-plan/09-events-calendar.md
result: PASS
run_at: 2026-05-09T23:50:00Z
---

# TASK-TC-9.7: Run TC-9.7 - Validation: end time before start

## Result: PASS

`event-create-edit.spec.ts:20` — "end before start shows field error and disables submit" PASS.

End field gains `form-field__input--error` class with text "End time must be after start time."
Submit button is disabled.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
