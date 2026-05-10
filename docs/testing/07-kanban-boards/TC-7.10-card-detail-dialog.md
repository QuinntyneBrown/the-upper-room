---
id: TASK-TC-7.10
title: 'Run TC-7.10 - Card detail dialog'
status: Completed
test_id: TC-7.10
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-09T23:13:00Z
---

# TASK-TC-7.10: Run TC-7.10 - Card detail dialog

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | ac993f4                     |
| Run at     | 2026-05-09T23:13:00Z        |

### Evidence

Verified via `e2e/tests/kanban/card-detail.spec.ts` (5 tests PASS) and `card-detail-dialog-material.spec.ts` (6 tests PASS) after BUG-035/036/037 fixes:

- `:86` — clicking card opens dialog with schema-defined fields (`[data-testid="card-detail-dialog"]` + `role="dialog"` + `aria-modal="true"`).
- Title input wrapped in Material form field; Archive / Delete / Close buttons have correct testids and material variants (text / text danger / icon).
- Schema fields render via `[data-testid="card-detail-field-{key}"]`; required fields enforce inline error on close.
- Add-comment textarea + Material flat button render and locally append.
- Attachments file input accepts PDFs.
- Inline title edit + blur persists via PATCH.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
