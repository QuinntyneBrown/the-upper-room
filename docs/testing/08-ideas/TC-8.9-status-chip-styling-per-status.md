---
id: TASK-TC-8.9
title: 'Run TC-8.9 - Status chip styling per status'
status: Completed
test_id: TC-8.9
source: ../../test-plan/08-ideas.md
result: FAIL
run_at: 2026-05-09T23:40:00Z
defect: BUG-039
---

# TASK-TC-8.9: Run TC-8.9 - Status chip styling per status

## Result: FAIL — chip text correct but no per-status colour token

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 1821089                     |
| Run at     | 2026-05-09T23:40:00Z        |

### Evidence

- `idea-detail.html:16` renders `<span data-testid="idea-status-chip" class="idea-status-chip">{{ i.status }}</span>` — text is correct.
- `idea-detail.scss:96-104` defines a single `.idea-status-chip` rule (background:
  `var(--md-sys-color-secondary-container)`) — no per-status modifier.
- No `idea-status-chip--Proposed/Submitted/Selected/...` classes exist anywhere in the ideas
  tree (verified via grep).
- All chips render with the same colour regardless of status.

Severity per test plan: Low.

Defect: [BUG-039](../../bugs/BUG-039-idea-status-chip-no-per-status-styling.md).

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
