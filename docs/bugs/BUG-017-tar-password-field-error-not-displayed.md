---
id: BUG-017
title: TarPasswordField and TarTextField error messages never display in zoneless app
severity: High
status: Fixed
suite: TC-02 Authentication
discovered_at: 2026-05-09T15:40:00Z
---

# BUG-017: TarPasswordField and TarTextField error messages never display

## Summary

`TarPasswordField` and `TarTextField` expose `@Input() error: string | null = null`. In a
zoneless Angular 21 app (no zone.js), `@if` control-flow blocks only re-evaluate when their
reactive dependencies (signals) change. Because `error` is a plain `@Input()` (not a
signal `input()`), the `@if (error)` block has no reactive dependency and never re-evaluates
after the initial render. Even when the parent correctly sets `[error]="someSignal()"`, the
child component's embedded view does not update and the `mat-error` element is never added to
the DOM.

## Steps to Reproduce

1. Navigate to `/reset-password?token=valid`
2. Enter different values in New password and Confirm password
3. Click Reset password
4. Observe: no "Passwords do not match." error shown (expected from TC-2.14)
5. Angular component inspection confirms `error = "Passwords do not match."` but template
   doesn't re-render

## Root Cause

App uses zoneless change detection (no zone.js). Angular's reactive scheduler only re-renders
components when tracked signals change. `@if (error)` reads a plain `@Input()` property
which is invisible to the reactive graph — the block never re-evaluates.

Confirmed: `typeof Zone === 'undefined'` in browser.

## Impact

- Error messages for `tar-text-field` and `tar-password-field` never display
- Password mismatch in reset-password is silently ignored (no feedback to user)
- Email duplicate error in sign-up is also never shown
- Any future use of the `error` input on these components is broken

## Fix

Convert `error`, `hint`, `value`, and other `@Input()` properties that are read inside `@if`
blocks or interpolations in TarPasswordField and TarTextField to signal-based `input()`.
Update templates to use `error()`, `hint()` etc.
