---
id: TASK-TC-3.2
title: 'Run TC-3.2 - Drawer opens, drawer scrim closes it'
status: Completed
test_id: TC-3.2
source: ../../test-plan/03-navigation.md
---

# TASK-TC-3.2: Run TC-3.2 - Drawer opens, drawer scrim closes it

## Goal

Run `TC-3.2` from `docs/test-plan/03-navigation.md` and record the result.

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
| Result | **PASS** (after fix) |
| Browser | Chromium (Playwright) |
| Viewport | 375×812 |
| Build SHA | e5e101c |
| Tester | Claude (automated) |
| Run at | 2026-05-09T16:30:00Z |

### Evidence

- Set viewport to 375×812 (mobile)
- `drawer-toggle` button visible at (16, 8) with 40×40 dimensions ✅
- Clicked `drawer-toggle` → `app-shell__drawer--open` class added, `aria-hidden="false"`, scrim visible ✅
- Clicked `drawer-scrim` → class `app-shell__drawer--open` removed, `aria-hidden="true"` ✅
- Pressed **Escape** (with drawer open) → drawer closed (`aria-hidden="true"`) ✅ (after BUG-018 fix)

### Bug found

- **[BUG-018](../../bugs/BUG-018-drawer-escape-key-does-not-close.md)**: Escape key did not close the drawer (nav element not focusable; keydown.escape binding on nav never fired). Fixed by adding Escape handling to the global `window:keydown` `@HostListener` in `app-shell.ts`.
