# BUG-033 — BoardDetailDto missing swimlaneMode; board view always shows columns layout

| Field | Value |
|---|---|
| ID | BUG-033 |
| Severity | High |
| Status | Fixed |
| Discovered | TC-7.15 |
| Component | `BoardDetailDto`, `BoardsController.GetById` |

## Description

`BoardDetailDto` did not include a `SwimlaneMode` property. As a result:

- `GET /api/v1/boards/{id}` always returned `swimlaneMode: null`.
- The frontend `BoardView.swimlaneMode()` computed always defaulted to `'None'`.
- Even after setting swimlane mode via `PATCH /api/v1/boards/{id}` (which persists
  correctly to SQLite), the board view never displayed swimlane rows.

## Root Cause

`BoardDetailDto` was defined with five positional parameters (Id, Name, Description,
Columns, Cards) but no `SwimlaneMode`. The `GetById` controller action also omitted
`board.SwimlaneMode` from the DTO constructor call.

## Fix

1. Added `string? SwimlaneMode` as the last parameter to `BoardDetailDto`.
2. Updated `BoardsController.GetById` to pass `board.SwimlaneMode` to the DTO.
