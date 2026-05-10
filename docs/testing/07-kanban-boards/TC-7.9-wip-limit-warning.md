---
id: TASK-TC-7.9
title: 'Run TC-7.9 - WIP limit warning'
status: Completed
test_id: TC-7.9
source: ../../test-plan/07-kanban-boards.md
result: PASS-WITH-CAVEAT
run_at: 2026-05-09T23:14:00Z
---

# TASK-TC-7.9: Run TC-7.9 - WIP limit warning

## Result: PASS (visualization + recovery) — snackbar variant still fails (TBD bug)

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | ac993f4                     |
| Run at     | 2026-05-09T23:14:00Z        |

### Evidence

- `wip-limits.spec.ts:93` — "over-limit column shows error-container highlight while dragging" PASS.
- `wip-limits.spec.ts:112` — "removing one card unlocks subsequent drops" PASS.
- `wip-limits.spec.ts:76` — "over-limit drop rejected with snackbar" still FAILS — to be filed as a follow-up bug; visualization works but the snackbar / accept-after-warning path differs from the test plan.

Visualization verified: column count switches to `{n} / {limit}`, gains `column--over-limit` class and `data-over-limit="true"` attribute when exceeded.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
