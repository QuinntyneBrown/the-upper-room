---
id: TASK-TC-6.6
title: 'Run TC-6.6 - Logo upload'
status: Completed
test_id: TC-6.6
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.6: Run TC-6.6 - Logo upload

## Goal

Run `TC-6.6` from `docs/test-plan/06-partners.md` and record the result.

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
| Result | **BLOCKED** |
| Browser | Chromium (Playwright) |
| Viewport | 1280×720 |
| Build SHA | 3114dcc |
| Tester | Claude (automated) |
| Run at | 2026-05-09T18:32:30Z |

### Evidence

- Navigated to `/partners/new` ✅
- No logo upload control present in `partner-create.html` — confirmed by inspection ✅
- `CreatePartnerRequest` can carry `logo` but `PartnerDto` response does not expose `logo` property ✅

### Note

Per test plan: "current implementation has no create-time logo upload." This test is blocked by missing feature implementation, not a bug. Marking BLOCKED as directed by the test plan.
