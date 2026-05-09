# BUG-034 — Cards not displayed in swimlane view

| Field | Value |
|---|---|
| ID | BUG-034 |
| Severity | High |
| Status | Fixed |
| Discovered | TC-7.15 |
| Component | `BoardsController.GetById`, `BoardDetailDto`, `BoardView.cardsForLane` |

## Description

When a board has `swimlaneMode` set to `'Assignee'`, the board view rendered the swimlane structure (including the "Unassigned" lane header) but showed **zero cards in every column**. All card counts showed `0`.

## Root Cause

Two interacting issues:

1. **Backend did not send `swimlaneKey`** — `BoardCardDto` had no `SwimlaneKey` field. The controller's `GetById` built cards with `Array.Empty<BoardCardTagDto>()` but no swimlane key. The frontend received `swimlaneKey: undefined` for every card.

2. **Frontend `cardsForLane` used strict equality** — The `swimlanes()` computed converts undefined `swimlaneKey` values via `card.swimlaneKey ?? ''`, producing the lane key `''` for all unassigned cards. However, `cardsForLane` filtered with:
   ```typescript
   .filter((c) => c.columnId === columnId && c.swimlaneKey === laneKey)
   ```
   Since `undefined === ''` is `false` in JavaScript, no card ever matched the `''` lane, producing empty columns.

## Fix

1. Added `string? SwimlaneKey` parameter to `BoardCardDto`.
2. Updated `BoardsController.GetById` to compute `swimlaneKey` per card:
   - When `swimlaneMode == "Assignee"`: `swimlaneKey = card.AssigneeName ?? ""`
   - Otherwise: `swimlaneKey = null`
3. Changed `cardsForLane` in `board-view.ts` to use `(c.swimlaneKey ?? '') === laneKey` as a defensive fallback.
