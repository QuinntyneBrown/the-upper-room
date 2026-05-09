---
id: BUG-016
title: Expired invitation page shows spurious error snackbar
severity: Low
status: Fixed
suite: TC-02 Authentication
discovered_at: 2026-05-09T15:21:00Z
---

# BUG-016: Expired invitation page shows spurious error snackbar

## Summary

When navigating to `/invitations/accept?token=<expired-token>` and the backend returns 404,
the correct "This invitation has expired." screen renders BUT a global error snackbar
("We couldn't find what you're looking for.") also appears. The snackbar is noise — the
component already handles the failure gracefully by showing the expired branch.

## Steps to Reproduce

1. Navigate to `http://localhost:4200/invitations/accept?token=expired-token`
2. Observe the "This invitation has expired." heading
3. Also observe the red snackbar "We couldn't find what you're looking for."

## Expected

Expired invitation screen renders. No snackbar appears.

## Actual

Both the expired screen AND an error snackbar appear.

## Root Cause

`SignUp.ngOnInit()` calls `GET /api/v1/invitations?token=...`. When this returns 404, the
global `errorInterceptor` catches the error, shows a snackbar, and re-throws. The component's
`catchError(() => of(null))` then catches the re-thrown error and correctly sets
`invitationExpired = true`, but the snackbar has already been displayed.

## Fix

Pass `new HttpContext().set(SKIP_ERROR_SNACKBAR, true)` on the invitation lookup so the
global interceptor skips the snackbar. The component handles the error state itself.
