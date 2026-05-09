# BUG-030 — Board cards do not navigate to board detail; no navigation after board creation

| Field | Value |
|---|---|
| ID | BUG-030 |
| Severity | Critical |
| Status | Fixed |
| Discovered | TC-7.2 / TC-7.5 |
| Component | `BoardList` |

## Description

Two related navigation failures in `board-list`:

1. **Board cards** in the grid were plain `<div>` elements with no `routerLink`, so clicking a board card did not navigate to the board detail page (`/boards/{id}`).
2. **After creating a board** via the wizard, the component only updated the list in-place; it did not navigate to the newly created board's detail page as expected by the test plan.

## Root Cause

- `board-list.html` rendered each board card as `<div>` without a `[routerLink]`.
- `BoardList.create()` updated the local signal but did not call `router.navigate()`.
- `RouterLink` was not in the component's `imports` array.

## Fix

1. Changed board card `<div>` to `<a [routerLink]="['/boards', board.id]">` in `board-list.html`.
2. Added `Router` and `RouterLink` imports to `board-list.ts`.
3. Added `router.navigate(['/boards', board.id])` in `BoardList.create()` after the API response.
