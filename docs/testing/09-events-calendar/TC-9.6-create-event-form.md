---
id: TASK-TC-9.6
title: 'Run TC-9.6 - Create event form'
status: Completed
test_id: TC-9.6
source: ../../test-plan/09-events-calendar.md
result: PASS
run_at: 2026-05-09T23:50:00Z
---

# TASK-TC-9.6: Run TC-9.6 - Create event form

## Result: PASS

- `event-create-edit.spec.ts:20` — "end before start shows field error and disables submit" PASS.
- `event-create-edit.spec.ts:33` — "pick location from autocomplete updates preview card" PASS.
- `event-create-edit.spec.ts:52` — "switch timezone updates timezone label; stored UTC value unchanged" PASS.
- `event-create-edit.spec.ts:68` — "save and reload — title round-trips correctly" PASS.

Form structure (Basics, When, Where, Who, Recurrence, Tags, Submit, Sidebar preview)
matches the test plan via source review of `event-form.html`.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
