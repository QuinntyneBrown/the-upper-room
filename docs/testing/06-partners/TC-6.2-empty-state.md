---
id: TASK-TC-6.2
title: 'Run TC-6.2 - Empty state'
status: Completed
test_id: TC-6.2
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.2: Run TC-6.2 - Empty state

## Goal

Run `TC-6.2` from `docs/test-plan/06-partners.md` and record the result.

## Execution

- Follow the source test case steps, verification notes, pass criteria, and severity.
- Capture browser, viewport, build SHA, result, tester, run timestamp, and defect link if the result fails.

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.

## Result

| Field | Value |
|---|---|
| Result | **PASS** |
| Browser | Chromium (Playwright) |
| Viewport | 1280×720 |
| Build SHA | 3114dcc |
| Tester | Claude (automated) |
| Run at | 2026-05-09T18:30:30Z |

### Evidence

- Mocked `GET /api/v1/partners` to return `{ items: [], total: 0 }` ✅
- `data-testid="partners-empty-state"` visible ✅
- `tar-empty-state` rendered with icon `domain_disabled`, heading "No partners yet", body "Add your first partner to get started." ✅
- `data-testid="partners-new-button"` (New partner link) present within empty state for admin user ✅
- `data-testid="partners-grid"` not rendered ✅
