---
id: TASK-TC-7.15
title: 'Run TC-7.15 - Swimlanes view groups by lane'
status: Completed
test_id: TC-7.15
source: ../../test-plan/07-kanban-boards.md
result: PASS
run_at: 2026-05-09T23:14:00Z
---

# TASK-TC-7.15: Run TC-7.15 - Swimlanes view groups by lane

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | ac993f4                     |
| Run at     | 2026-05-09T23:14:00Z        |

### Evidence

`e2e/tests/kanban/swimlanes.spec.ts:43` — "configure board with Assignee swimlanes → 3 horizontal bands" PASS.
`e2e/tests/kanban/swimlanes.spec.ts:59` — "drag card across lanes posts targetSwimlaneKey in move body" PASS.

- Container `[class="swimlanes"]` rendered.
- Each `[data-testid="board-swimlane-{lane}"]` shows a header and the cards belonging to that lane.
- Cards live inside `[data-testid="board-column-{name}"]` per lane.
- Dragging a card across a lane fires the move POST with `targetSwimlaneKey` in the body, reassigning the assignee.

Note: `swimlanes.spec.ts:82` ("disable swimlanes via configure page → board view shows flat columns") still fails — see follow-up bug to file in next iteration.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
