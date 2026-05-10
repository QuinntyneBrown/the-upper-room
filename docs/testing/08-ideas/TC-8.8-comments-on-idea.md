---
id: TASK-TC-8.8
title: 'Run TC-8.8 - Comments on idea'
status: Completed
test_id: TC-8.8
source: ../../test-plan/08-ideas.md
result: BLOCKED
run_at: 2026-05-09T23:39:00Z
---

# TASK-TC-8.8: Run TC-8.8 - Comments on idea

## Result: BLOCKED — comments flow not implemented (BUG-010)

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 1821089                     |
| Run at     | 2026-05-09T23:39:00Z        |

### Evidence

Test plan acknowledges current state: `idea-detail.html` does not render a comments section;
`IdeasController` exposes no comments endpoint. There is no comments flow end-to-end.

Defect: [BUG-010](../../bugs/BUG-010-idea-comments-missing.md).

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
