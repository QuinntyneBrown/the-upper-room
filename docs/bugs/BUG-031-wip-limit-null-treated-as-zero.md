# BUG-031 — wipLimit null treated as WIP limit of 0

| Field | Value |
|---|---|
| ID | BUG-031 |
| Severity | Critical |
| Status | Fixed |
| Discovered | TC-7.7 |
| Component | `BoardView` |

## Description

The backend returns `wipLimit: null` for columns with no WIP limit. The frontend
`BoardColumn` interface declares `wipLimit?: number` (optional), expecting `undefined`
when there is no limit. However, JSON deserialization produces `null`, not `undefined`.

Two checks were broken:

1. **`isOverLimit`**: `column.wipLimit !== undefined` evaluates to `true` when
   `wipLimit` is `null`, and `cardCount >= null` coerces to `0 >= 0 = true`. This
   caused every column to report itself as "over limit", blocking all card moves.

2. **Template**: `@if (column.wipLimit !== undefined)` showed the `x / wipLimit`
   display for every column regardless of whether a limit was actually configured,
   rendering the display as "0 / " (null renders as empty string).

## Root Cause

`null !== undefined` is `true` in JavaScript/TypeScript. Using strict inequality against
`undefined` does not guard against `null` values returned from the backend.

## Fix

Changed both checks to use `!= null` (loose equality, guards both `null` and `undefined`):

- `board-view.ts`: `isOverLimit` now uses `column.wipLimit != null`
- `board-view.html`: template `@if` now uses `column.wipLimit != null`
