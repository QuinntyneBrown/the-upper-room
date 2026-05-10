---
id: TASK-TC-9.8
title: 'Run TC-9.8 - Edit recurring event scope dialog'
status: Completed
test_id: TC-9.8
source: ../../test-plan/09-events-calendar.md
result: PASS
run_at: 2026-05-09T23:50:00Z
---

# TASK-TC-9.8: Run TC-9.8 - Edit recurring event scope dialog

## Result: PASS

- `recurrence.spec.ts:60` — "Editing recurring occurrence shows edit scope dialog" PASS.
- `recurrence.spec.ts:93` — "Choosing 'This event only' from edit dialog dismisses dialog and shows form" PASS.

Dialog `[data-testid="recurrence-edit-dialog"]` opens with title "Edit recurring event" and the
three scope buttons (single / following / series) present.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
