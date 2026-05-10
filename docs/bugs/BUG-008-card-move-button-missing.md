# BUG-008 — Card detail dialog has no "Move" button (mobile move flow broken) (RESOLVED 2026-05-10)

**Severity**: Medium
**Component**: frontend
**Found in test**: TC-7.8 (Move card on mobile)
**User-guide refs**: §7.5 (mobile move sheet)
**Found**: 2026-05-09
**Status**: FIXED 2026-05-10 — card-detail-dialog header now renders a Move button (`data-testid="card-detail-move"`) that closes with `{ kind: 'move' }`; board-view opens the existing `BoardMoveSheetDialog` and POSTs `/api/v1/cards/{id}/move`. TC-7.8 PASS.

## Description

User guide §7.5 (Mobile flow) tells the user to tap a card, then tap **Move** in the card detail dialog to open the column move sheet. The card detail dialog template has no Move button.

## Reproduction

1. Open the app at a mobile viewport (≤ 600px) and sign in.
2. Open a board and tap any card.
3. The card detail dialog opens.
4. Look for a **Move** button.
5. Observe: no Move button is present.

## Expected

A **Move** button visible in the dialog (at least on mobile widths) that opens the column move sheet. Tapping a column moves the card.

## Actual

`frontend/projects/the-upper-room/src/app/kanban/card-detail-dialog/card-detail-dialog.html` (67 lines) contains no string matching `Move` or `move-sheet`.

The board view does open a move sheet via long-press (`onCardPointerDown` in `board-view.ts`), but that affordance is undocumented and is not the flow the user guide describes.

## Suggested fix

Either:

- Add a **Move** button (`<tar-button variant="text" (click)="openMoveSheet()">Move</tar-button>`) to the dialog template, wired to the existing move-sheet component, **or**
- Update user guide §7.5 to document the long-press affordance (and add an explicit hint in the UI on first use).

The first option is preferable because long-press is hard to discover.
