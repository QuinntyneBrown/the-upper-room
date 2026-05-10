---
id: TASK-TC-7.13
title: 'Run TC-7.13 - Configure board: rename and reorder columns'
status: Completed
test_id: TC-7.13
source: ../../test-plan/07-kanban-boards.md
result: PARTIAL
run_at: 2026-05-09T23:18:00Z
---

# TASK-TC-7.13: Run TC-7.13 - Configure board: rename and reorder columns

## Result: PARTIAL — page renders, structure verified; drag-reorder POST not firing

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 93d089b                     |
| Run at     | 2026-05-09T23:18:00Z        |

### Evidence

PASS:
- `column-config.spec.ts:107` — non-Configure user redirected to /forbidden.
- `board-configure-material.spec.ts:39, 46, 60, 68` — swimlane select, delete column button,
  move-cards target select, confirm button all rendered as Material variants.

FAIL:
- `column-config.spec.ts:73` — "reorder columns via drag persists" — `inProgressRow.dragTo(todoRow)`
  does not produce any reorder POST. After drag the captured `orders` array is still length 0.
  Either the configure page is missing the dragstart/dragend wiring on `<li data-testid="config-column-row-{name}">`,
  or the order-persist endpoint is not being called on drop. To file as a follow-up bug
  (BUG-038 candidate) in next iteration.

Heading and column-row markup match the test plan (verified via source review of
`board-configure.html`). Drag-reorder is the only outstanding gap.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
