---
id: TASK-TC-7.1
title: 'Run TC-7.1 - Board list (empty state)'
status: Completed
test_id: TC-7.1
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-09T22:36:00Z
---

# TASK-TC-7.1: Run TC-7.1 - Board list (empty state)

## Goal

Run `TC-7.1` from `docs/test-plan/07-kanban-boards.md` and record the result.

## Execution

- Follow the source test case steps, verification notes, pass criteria, and severity.
- Capture browser, viewport, build SHA, result, tester, run timestamp, and defect link if the result fails.

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (playwright-cli)   |
| Viewport   | 1280×720                    |
| Build SHA  | b647468                     |
| Run at     | 2026-05-09T22:36:00Z        |
| Tester     | Claude (automated)          |

### Checks

- [x] `<div data-testid="boards-empty-state">` rendered
- [x] `tar-empty-state` icon `view_kanban` present
- [x] `<h2 data-testid="empty-heading">` text = "No boards yet"
- [x] body text = "Create a board to organize your work."
- [x] `<button data-testid="boards-new-button">` visible

### Evidence

- Mocked `GET /api/v1/boards**` to return `{items:[], total:0}`.
- Seeded auth via `window.__setTestToken('lead-token')` and `window.__setRbac({...CityLead, KanbanBoard:View, KanbanBoard:Create})`.
- SPA-navigated to `/boards` via `history.pushState` (full `page.goto()` resets in-memory token; logged as BUG-035).
- DOM query confirmed all expected `data-testid` attributes and copy.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
