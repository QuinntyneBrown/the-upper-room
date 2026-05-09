---
id: TASK-TC-2.14
title: 'Run TC-2.14 - Reset-password mismatch shows confirm error'
status: Completed
test_id: TC-2.14
source: ../../test-plan/02-authentication.md
---

# TASK-TC-2.14: Run TC-2.14 - Reset-password mismatch shows confirm error

## Goal

Run `TC-2.14` from `docs/test-plan/02-authentication.md` and record the result.

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
| Result | **FAIL → Fixed** |
| Browser | Chromium (Playwright) |
| Viewport | 1280×720 |
| Build SHA | a1a6dc3 |
| Tester | Claude (automated) |
| Run at | 2026-05-09T15:55:00Z |
| Defect | [BUG-017](../../bugs/BUG-017-tar-password-field-error-not-displayed.md) |

### Evidence

- Entered "Password!23456" in New password, "WrongPwd!9876" in Confirm password
- Clicked "Reset password"
- **FAIL (before fix)**: No error message shown — `mat-error` was not rendering due to Angular Material requiring NgControl for `_shouldShowError()`, combined with zoneless CD not re-evaluating `@if` blocks with non-signal `@Input()` properties
- **PASS (after fix)**: Alert "Passwords do not match." appeared correctly ✅
- No network request made (mismatch blocks submit) ✅

### Fix Applied

- Converted `@Input()` properties in `TarPasswordField` and `TarTextField` to signal `input()` for reactivity in zoneless mode
- Moved error display outside `mat-form-field` (span with `role="alert"`) to bypass Angular Material's `_shouldShowError()` guard
