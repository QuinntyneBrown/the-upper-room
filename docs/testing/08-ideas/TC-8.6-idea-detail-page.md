---
id: TASK-TC-8.6
title: 'Run TC-8.6 - Idea detail page'
status: Completed
test_id: TC-8.6
source: ../../test-plan/08-ideas.md
result: PASS
run_at: 2026-05-09T23:38:00Z
---

# TASK-TC-8.6: Run TC-8.6 - Idea detail page

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 1821089                     |
| Run at     | 2026-05-09T23:38:00Z        |

### Evidence

- `idea-detail-editor.spec.ts:54` — "idea detail renders sanitized HTML body with cover image" PASS.
- `idea-detail-editor.spec.ts:70` — "editor bold toolbar wraps selection in **...**; preview renders bolded" PASS.
- `idea-detail-editor.spec.ts:119` — "typing past 10000 chars rejects further input and counter turns error" PASS.
- Source review of `idea-detail.html` confirms: hero image testid, title testid, proposer testid,
  status chip testid, vote button, Edit button, Submit-for-review button (conditional), status
  select for leads, edit-mode markdown editor with Save/Cancel.

The `idea-status.spec.ts` family of failures is caused by `/api/v1/users/me` not being mocked in
those specs (component fetches `me()` to compute `isProposer()` / `canSubmit()`). That is a
spec-side mock gap, not a TC-8.6 defect.

The `markdown-editor-via-library.spec.ts:30` failure uses a stale testid (`idea-edit-button`)
that no longer exists; the actual edit button is `[data-testid="idea-detail-edit"]`. Spec-side
issue, not a TC-8.6 defect.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
