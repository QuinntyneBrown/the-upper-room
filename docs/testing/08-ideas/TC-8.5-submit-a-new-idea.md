---
id: TASK-TC-8.5
title: 'Run TC-8.5 - Submit a new idea'
status: Completed
test_id: TC-8.5
source: ../../test-plan/08-ideas.md
result: BLOCKED
run_at: 2026-05-09T23:38:00Z
---

# TASK-TC-8.5: Run TC-8.5 - Submit a new idea

## Result: BLOCKED — submission flow missing (BUG-009)

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 1821089                     |
| Run at     | 2026-05-09T23:38:00Z        |

### Evidence

Test plan acknowledges current state: `idea-list.html` does not render a New Idea button;
`IdeasController` does not expose `POST /api/v1/ideas`; backend does not write idea audit
entries. No submission flow exists end-to-end.

Defect: [BUG-009](../../bugs/BUG-009-new-idea-button-missing.md).

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
