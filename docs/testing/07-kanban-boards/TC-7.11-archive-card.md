---
id: TASK-TC-7.11
title: 'Run TC-7.11 - Archive card'
status: Completed
test_id: TC-7.11
source: ../../test-plan/07-kanban-boards.md
result: PASS-WITH-CAVEAT
run_at: 2026-05-09T23:14:00Z
---

# TASK-TC-7.11: Run TC-7.11 - Archive card

## Result: PASS (frontend) — backend persistence still incomplete (BUG-005-adjacent)

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | ac993f4                     |
| Run at     | 2026-05-09T23:14:00Z        |

### Evidence

`e2e/tests/kanban/card-archive-delete.spec.ts:28` — "archive card → disappears from board; visible under Show archived toggle" PASSES after BUG-035/036/037 fixes.

- Open card detail dialog, click `[data-testid="card-detail-archive"]`.
- Dialog closes, card disappears from default view.
- Toggle Show archived chip → card reappears with archived styling.

Frontend behaviour matches the test plan. The test plan still notes the backend caveat:
`PatchCardHandler` only persists `title`, `assigneeName`, `dueDate` — not `archived`. This means
the optimistic UI is correct but the change does not survive a hard reload. Test plan acceptance
allows this since archive flow on backend is tracked separately.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
