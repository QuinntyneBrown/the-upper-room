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
| Result | **FAIL** → **PASS** (re-verified after fix) |
| Browser | Chromium (Playwright) |
| Viewport | 1280×720 |
| Build SHA | e44905f |
| Tester | Claude (automated) |
| Run at | 2026-05-09T17:18:00Z |

### Initial Failure Evidence (Build aef6c7d)

- Navigated to `/contacts` while city = Toronto — contacts API called once ✅
- Switched city to Halifax via city switcher — NO new API call was made ❌
- Contacts list still shows Alice (Toronto contact), Bob (Halifax) not shown ❌

### Re-verification Evidence (Build e44905f)

- Navigated to `/contacts` with All Cities scope — both Alice and Bob shown ✅
- Clicked "Toronto" in city switcher — contacts API called with `scope=toronto` ✅
- Only Alice shown in contacts list ✅
- Switched to Halifax — contacts API called with `scope=halifax` ✅
- Only Bob shown in contacts list ✅

### Bugs Fixed

- **[BUG-020](../../bugs/BUG-020-city-switch-does-not-rescope-contact-list.md)**: City switch does not re-scope the contacts list. Fixed by adding `CityScopeService` injection and an `effect()` in `ContactList`.
- **[BUG-021](../../bugs/BUG-021-cities-api-endpoint-missing.md)**: Cities API endpoint missing. Fixed by adding `CitiesController` and `CitiesDbContext`.
- **[BUG-023](../../bugs/BUG-023-city-switcher-cities-never-loaded.md)**: City switcher never fetches city list. Fixed by using constructor `effect()` in `TarCitySwitcher`.
- **Backend LINQ fix**: `contacts?scope=toronto` returned 500 due to untranslatable `StringComparison.OrdinalIgnoreCase`. Fixed by calling `.AsEnumerable()` before `.Where()`.
