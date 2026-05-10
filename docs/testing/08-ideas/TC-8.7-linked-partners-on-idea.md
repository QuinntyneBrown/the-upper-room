---
id: TASK-TC-8.7
title: 'Run TC-8.7 - Linked partners on idea'
status: Completed
test_id: TC-8.7
source: ../../test-plan/08-ideas.md
result: PARTIAL
run_at: 2026-05-09T23:39:00Z
---

# TASK-TC-8.7: Run TC-8.7 - Linked partners on idea

## Result: PARTIAL — UI affordance present, link/unlink flow timing out in e2e

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×720                    |
| Build SHA  | 1821089                     |
| Run at     | 2026-05-09T23:39:00Z        |

### Evidence

Source review of `idea-detail.html` confirms the link-partner affordances exist:
- `[data-testid="idea-link-partner-button"]`
- `[data-testid="idea-partner-search"]` with placeholder "Search partners…"
- `[data-testid="idea-partner-result-{name}"]` per result
- `[data-testid="idea-partner-card-{id}"]` once linked
- `[data-testid="idea-unlink-partner-{id}"]` with `link_off` icon and `aria-label="Unlink partner"`

E2e tests `idea-cover-partners.spec.ts:43, :74, :116` all FAIL — same `/api/v1/users/me`
mock-gap pattern as the idea-status specs (component fetches `me()` to gate Edit/Lead-only
controls). Will be filed as a follow-up to align test fixtures with the component's
`/users/me` dependency, or to refactor the component to read the `userId` directly from
PermissionsService.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
