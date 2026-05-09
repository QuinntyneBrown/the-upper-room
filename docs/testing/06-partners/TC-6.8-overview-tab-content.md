---
id: TASK-TC-6.8
title: 'Run TC-6.8 - Overview tab content'
status: Completed
test_id: TC-6.8
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.8: Run TC-6.8 - Overview tab content

## Goal

Run `TC-6.8` from `docs/test-plan/06-partners.md` and record the result.

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
| Run at | 2026-05-09T18:33:30Z |

### Evidence

- Navigated to `/partners/p-seed` and Overview tab selected by default ✅
- `data-testid="partner-description"` present ✅
- Seed partner has no description → `partner-description--empty` class applied and text "No description yet." shown ✅
- No addresses rendered for seed partner (section hidden when empty) ✅
- No social links rendered for seed partner (section hidden when empty) ✅
