# BUG-041 — Location delete 409 surfaces generic error; no "Archive instead" action (RESOLVED 2026-05-09)

**Severity**: Medium
**Component**: frontend (`projects/the-upper-room/src/app/locations/`)
**Found in test**: TC-10.6 (location-crud.spec.ts:95)
**Found**: 2026-05-09
**Status**: FIXED 2026-05-09 — `LocationList.deleteLocation` now sets `SKIP_ERROR_SNACKBAR` on the DELETE so the global interceptor doesn't queue a generic error in front, and explicitly handles the 409 with a `SnackbarService.show(..., { label: "Archive instead", onClick: () => archiveLocation(...) })` action. Test seedUser also mocks `/users/me`/`/notifications`/`/cities` so page-load doesn't pre-empt the queue. `location-crud.spec.ts` now 4/4 PASS (commit `bf65789`).

## Description

When deleting a location that is referenced by a future event, the backend correctly returns
`409 Conflict`. The frontend currently routes this through the generic `errorInterceptor`,
which shows the catch-all snackbar copy "Something went wrong on our end." with a Dismiss
button — no contextual "Archive instead" action.

The test plan and `location-crud.spec.ts:95` expect the snackbar to surface an **Archive
instead** action that, on click, sends a `PATCH /api/v1/locations/{id}` with `{ archived: true }`.

## Reproduction

1. Create a location.
2. Schedule a future event at that location.
3. Click **Delete** on the location card → confirm.
4. Backend responds 409. Snackbar text: "Something went wrong on our end." No archive action.

## Expected

Snackbar shows the conflict-aware message with an **Archive instead** button. Clicking it
archives the location and dismisses the snackbar.

## Suggested fix (ATDD)

In the location-list / delete handler, intercept `409` from the delete call and call
`SnackbarService.show(...)` with an action button bound to a `PATCH .../locations/{id}` archive
call. Add a regression spec asserting both the snackbar copy and the follow-up PATCH.
