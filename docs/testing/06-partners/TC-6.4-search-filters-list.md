---
id: TASK-TC-6.4
title: 'Run TC-6.4 - Search filters list'
status: Completed
test_id: TC-6.4
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.4: Run TC-6.4 - Search filters list

## Goal

Run `TC-6.4` from `docs/test-plan/06-partners.md` and record the result.

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
| Run at | 2026-05-09T18:31:30Z |

### Evidence

- Navigated to `/partners` ✅
- Typed "Grace" into `data-testid="partners-search"` ✅
- `GET /api/v1/partners?search=Grace` intercepted; seed partner card remains visible ✅
- Typed "zzz" (no matches); `GET /api/v1/partners?search=zzz` returned empty; empty state rendered ✅
- Cleared search; full list restored ✅
