# BUG-007 — Kanban board view has no "+ Add card" button (RESOLVED 2026-05-10)

**Severity**: Critical
**Component**: frontend
**Found in test**: TC-7.6 (Add card)
**User-guide refs**: §7.4
**Found**: 2026-05-09
**Status**: FIXED 2026-05-10 — board-view now renders the column-footer add-card affordance and POSTs `/api/v1/boards/{id}/cards`. TC-7.6 PASS.

## Description

User guide §7.4 instructs users to add a card by clicking **+ Add card** at the bottom of any column. No such control exists in the board view template — there is no way to create a card via the documented UI affordance.

## Reproduction

1. Sign in and open any board (`/boards/:id`).
2. Look at the bottom of any column.
3. Observe: no **+ Add card** button, no inline composer, no FAB scoped to the column.

## Expected

Each column ends with a clickable **+ Add card** affordance that opens the new-card editor (per user guide §7.4). On submit, a `POST /api/v1/cards` is sent and the card appears at the top of the column.

## Actual

`frontend/projects/the-upper-room/src/app/kanban/board-view/board-view.html` (177 lines) contains no string matching `add card`, `Add`, `composer`, `column-footer`, or `tar-fab`. The column rendering ends with the last existing card and nothing else.

```bash
grep -nE "Add|add|new-card|composer|column-footer" \
  frontend/projects/the-upper-room/src/app/kanban/board-view/board-view.html
# (no matches)
```

## Suggested fix

At the bottom of each column's `@for` loop (and inside the column wrapper) render a button:

```html
<button
  type="button"
  class="column__add-card"
  data-testid="column-add-card"
  (click)="onAddCardClick(column.id)"
>
  + Add card
</button>
```

Wire `onAddCardClick(columnId)` to open the existing card-detail dialog in create mode (or a dedicated composer). On save, `POST /api/v1/cards` and prepend the new card.
