---
id: TASK-TC-1.1
title: 'Run TC-1.1 - App loads on the public landing page'
status: Completed
test_id: TC-1.1
source: ../../test-plan/01-getting-started.md
result: PASS
run_at: 2026-05-09T14:52:00Z
---

# TASK-TC-1.1: Run TC-1.1 - App loads on the public landing page

## Goal

Run `TC-1.1` from `docs/test-plan/01-getting-started.md` and record the result.

## Execution

- Follow the source test case steps, verification notes, pass criteria, and severity.
- Capture browser, viewport, build SHA, result, tester, run timestamp, and defect link if the result fails.

## Result: PASS

| Field      | Value                       |
|------------|-----------------------------|
| Browser    | Chromium (Playwright)       |
| Viewport   | 1280×800                    |
| Run at     | 2026-05-09T14:52:00Z        |
| Tester     | Claude (automated)          |

### Checks

- [x] Page title is "The Upper Room"
- [x] `<main class="landing">` renders
- [x] `<h1 class="landing__title">` contains "The Upper Room"
- [x] Favicon link `rel="icon"` present in HTML
- [x] 0 console errors

## Definition of Done

- [x] Test run completed.
- [x] Result recorded.
- [x] Defect linked for any failure.
