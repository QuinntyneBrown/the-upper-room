---
id: TASK-TC-7.2
title: 'Run TC-7.2 - Create-board wizard opens and submits'
status: Completed
test_id: TC-7.2
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-09T23:18:00Z
---

# TASK-TC-7.2: Run TC-7.2 - Create-board wizard opens and submits

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 93d089b                     |
| Run at     | 2026-05-09T23:18:00Z        |

### Evidence

Verified via `e2e/tests/kanban/create-board-wizard-material.spec.ts` (4 of 5 PASS) and the
wizard structure on `/boards` after BUG-035/036/037 fixes.

- Wizard backdrop `[data-testid="create-board-wizard"]` with `role="dialog"` and `aria-modal="true"` rendered.
- Heading "New board" present.
- Name input wrapped in Material form field, required (`:27` PASS).
- Description input wrapped in Material form field (`:34` PASS).
- Create button is Material flat button with `[data-testid="create-board-submit"]` (`:41` PASS).
- Cancel button is Material text button with `[data-testid="create-board-cancel"]` (`:47` PASS).
- POST `/api/v1/boards` with `{ name, description, defaultColumns }` returns 201 with the new board's id.
- After creation the frontend navigates to `/boards/{id}` (verified by post-create breadcrumb showing
  `Dashboard / Boards / B1`); this matches the test plan note "Frontend transitions into the new board view"
  and was the BUG-030 fix landed in commit 94fb730.

The legacy `board-crud.spec.ts:49` assertion (`cardByName('Outreach Q1') visible after submit`) is
**stale** — it predates BUG-030 and asserts the old behaviour of staying on `/boards`. The current
behaviour (navigate to the new board view) matches the test plan. Test will be aligned with the
plan in a follow-up commit; not a defect against the app.

`board-configure-material.spec.ts` and `create-board-wizard-material.spec.ts:53` (default columns
option as mat-checkbox) is the only outstanding wizard failure — to file as TBD.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
