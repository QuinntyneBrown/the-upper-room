---
id: TASK-TC-6.3
title: 'Run TC-6.3 - Floating action button (mobile)'
status: Completed
test_id: TC-6.3
source: ../../test-plan/06-partners.md
---

# TASK-TC-6.3: Run TC-6.3 - Floating action button (mobile)

## Goal

Run `TC-6.3` from `docs/test-plan/06-partners.md` and record the result.

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
| Viewport | 375×812 (mobile xs) |
| Build SHA | 3114dcc |
| Tester | Claude (automated) |
| Run at | 2026-05-09T18:31:00Z |

### Evidence

- Resized viewport to 375×812 ✅
- `data-testid="partners-fab"` (`<button aria-label="New partner">`) visible ✅
- FAB contains `+` glyph text ✅
