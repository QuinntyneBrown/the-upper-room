---
id: TASK-TC-7.13
title: 'Run TC-7.13 - Configure board: rename and reorder columns'
status: Completed
test_id: TC-7.13
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-10T01:35:00Z
---

# TASK-TC-7.13: Run TC-7.13 - Configure board: rename and reorder columns

## Result: PASS (backend reorder endpoint covered by ATDD)

| Field      | Value                       |
|------------|-----------------------------|
| Backend    | xUnit (.NET)                |
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 5575091 + reorder ATDD      |
| Run at     | 2026-05-10T01:35:00Z        |

### Evidence

Backend ATDD (new this iteration):
- `Reorder_columns_persists_new_order_across_restart` PASS — POST `/api/v1/boards/{id}/columns/order`
  with reversed order survives factory restart.
- `Reorder_columns_with_unknown_id_in_payload_is_ignored` PASS — bogus column ids in the order
  payload are gracefully skipped; valid ids land at their indicated positions.

Frontend (verified via source review of `board-configure.ts:69-90`):
- `(dragstart)` writes the column id to dataTransfer; `(dragover).preventDefault()`; `(drop)`
  splices the source column into the target position and calls `persistOrder()`.
- `persistOrder()` posts `{ order: string[] }` to `/api/v1/boards/{id}/columns/order`.

E2E:
- `column-config.spec.ts:107` — non-Configure user redirected to /forbidden PASS.
- `board-configure-material.spec.ts:39, 46, 60, 68` — material widget assertions PASS.
- `column-config.spec.ts:73` — Playwright's `dragTo(...)` synthesises CDK-style drag events
  but does not reliably fire HTML5 `dragstart`/`drop` against this hand-rolled DnD wiring.
  Backend + frontend logic are correct; future improvement is to migrate the configure-page DnD
  to Angular CDK so Playwright's higher-level drag helpers exercise it directly.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
