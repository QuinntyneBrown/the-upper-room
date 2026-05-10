---
id: TASK-TC-8.3
title: 'Run TC-8.3 - Sort dropdown'
status: Completed
test_id: TC-8.3
source: ../../test-plan/08-ideas.md
result: PARTIAL
run_at: 2026-05-09T23:36:00Z
defect: BUG-038
---

# TASK-TC-8.3: Run TC-8.3 - Sort dropdown

## Result: PARTIAL — options present and correct; selecting "Most votes" does not visibly resort

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 2db73af                     |
| Run at     | 2026-05-09T23:36:00Z        |

### Evidence

- Source review of `idea-list.html:13-22` confirms the three options with exact values
  `newest | votes | updated` and labels `Newest | Most votes | Updated`.
- `idea-list.ts:46-58` `buildParams()` correctly emits `?sort=votes` when the sort signal flips,
  and the API request URL reflects that.
- **FAIL**: `idea-list-vote.spec.ts:125` — after `sortSelect().selectOption('votes')`, the first
  card on screen is still "Few votes", not "Many votes". Either the change event isn't propagating
  to the signal, or the second API request isn't being awaited before the assertion. Filed as
  BUG-038.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
