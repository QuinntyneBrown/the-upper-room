---
id: TASK-TC-3.1
title: 'Run TC-3.1 - Top bar layout (left -> right)'
status: Completed
test_id: TC-3.1
source: ../../test-plan/03-navigation.md
---

# TASK-TC-3.1: Run TC-3.1 - Top bar layout (left -> right)

## Goal

Run `TC-3.1` from `docs/test-plan/03-navigation.md` and record the result.

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
| Build SHA | e44905f |
| Tester | Claude (automated) |
| Run at | 2026-05-09T17:15:00Z |

### Evidence

- Top bar has 6 children in correct order: drawer-toggle, app-name anchor, spacer, city-switcher, notification-bell, avatar ✅
- `tar-icon-button.app-shell__drawer-toggle` has `icon="menu"`, inner button has `data-testid="drawer-toggle"` and `aria-label="Open navigation"` ✅
- App name `<a class="app-shell__app-name">` text "The Upper Room" ✅ (changed to `<a>` by BUG-019 fix)
- `<span class="app-shell__spacer">` present ✅
- `<tar-city-switcher>` present ✅
- `<tar-notification-bell>` present ✅
- Avatar div contains button with `data-testid="avatar-trigger"` and `aria-label="Account menu"` ✅
- Scroll elevation: scrolling to 300px adds `app-shell__top-bar--elevated` class ✅
- Drawer toggle: clicking opens drawer (adds `app-shell__drawer--open`, sets `aria-hidden="false"`) ✅

