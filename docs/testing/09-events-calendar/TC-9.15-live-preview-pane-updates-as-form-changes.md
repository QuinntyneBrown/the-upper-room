---
id: TASK-TC-9.15
title: 'Run TC-9.15 - Live preview pane updates as form changes'
status: Completed
test_id: TC-9.15
source: ../../test-plan/09-events-calendar.md
result: PASS
run_at: 2026-05-09T23:55:00Z
---

# TASK-TC-9.15: Run TC-9.15 - Live preview pane updates as form changes

## Result: PASS

`event-create-edit.spec.ts:33` — "pick location from autocomplete updates preview card" PASS.
`event-create-edit.spec.ts:52` — "switch timezone updates timezone label" PASS.

The live preview testids are all present in `event-form.html:214` (`event-preview-title`,
`event-preview-start-time`) and the location preview reflects the form state. Empty title shows
"Untitled Event"; virtual / location-TBD branches render correctly.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
