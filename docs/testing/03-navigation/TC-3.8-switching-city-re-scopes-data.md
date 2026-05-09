---
id: TASK-TC-3.8
title: 'Run TC-3.8 - Switching city re-scopes data'
status: Completed
test_id: TC-3.8
source: ../../test-plan/03-navigation.md
---

# TASK-TC-3.8: Run TC-3.8 - Switching city re-scopes data

## Goal

Run `TC-3.8` from `docs/test-plan/03-navigation.md` and record the result.

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
| Result | **FAIL** → Fixed |
| Browser | Chromium (Playwright) |
| Viewport | 1280×720 |
| Build SHA | aef6c7d |
| Tester | Claude (automated) |
| Run at | 2026-05-09T16:45:00Z |

### Evidence

- Navigated to `/contacts` while city = Toronto — contacts API called once ✅
- Switched city to Halifax via city switcher — NO new API call was made ❌
- Contacts list still shows Alice (Toronto contact), Bob (Halifax) not shown ❌

### Root Cause

`ContactList` does not inject `CityScopeService` and does not react to city scope changes. The city switcher updates `CityScopeService.active()` but the contacts list is not subscribed to this signal.

### Bug found

- **[BUG-020](../../bugs/BUG-020-city-switch-does-not-rescope-contact-list.md)**: City switch does not re-scope the contacts list. Fixed by adding `CityScopeService` injection and an `effect()` in `ContactList` that reloads when the city scope changes.
