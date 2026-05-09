# Section 7 — Kanban Boards

> Mirrors `docs/user-guide.md` §7.

## Pre-conditions

- Signed in.
- For configure tests: user has `KanbanBoard:Configure` (route guard at `frontend/projects/the-upper-room/src/app/app.routes.ts:88-93`).
- Kanban data is stored in `KanbanDbContext` (`Data/kanban.db`) with `Boards`, `BoardColumns`, and `Cards` tables.

## Tests

### TC-7.1 — Board list (empty state)

**Steps**

1. Navigate to `/boards`.

**UI verification**

- Toolbar `<div class="toolbar">` with `<h1 class="page-title">Boards</h1>` (`board-list.html:1-3`).
- Empty state `<div data-testid="boards-empty-state">` rendering `tar-empty-state` with `icon="view_kanban"`, `heading="No boards yet"`, `body="Create a board to organize your work."`.
- **New board** button (`data-testid="boards-new-button"`) shown both in empty-state slot and toolbar when there are boards.

**Pass criteria**: copy and icon match exactly.

**Severity if failing**: Medium.

---

### TC-7.2 — Create-board wizard opens and submits

**Steps**

1. Click **New board**.
2. Wizard dialog opens (`<app-create-board-wizard>`).

**UI verification**

- Wizard backdrop `<div data-testid="create-board-wizard" role="dialog" aria-modal="true" aria-labelledby="create-board-title">` (`frontend/projects/the-upper-room/src/app/kanban/create-board-wizard/create-board-wizard.html:1`).
- Heading **"New board"**.
- Field 1: label **"Name"**, `data-testid="create-board-name"`, required.
- Field 2: label **"Description"**, textarea, `data-testid="create-board-description"`.
- Checkbox: text **"Create with default columns (To do, In progress, Done)"**, `data-testid="create-board-default-columns"`.
- Buttons: **Cancel** (`data-testid="create-board-cancel"`, `btn-text`) and **Create** (`data-testid="create-board-submit"`, `btn-filled`).

**Behavior verification**

- API: `POST /api/v1/boards` body `{ "name": "Sprint 1", "description": "...", "defaultColumns": true }` (`BoardsController.cs:42-62`).
- Returns `201 Created` with `{ id, name, description, columnCount, cardCount, lastActivityAt }`. With `defaultColumns=true`, `columnCount` is **3**. Otherwise **0**.
- Frontend transitions into the new board view.

**State/API verification**

- `KanbanDbContext.Boards` has the new board row.
- When `defaultColumns=true`, `KanbanDbContext.Columns` has To Do, In Progress, and Done rows for that board.

**Pass criteria**: wizard submits; new board appears in list.

**Severity if failing**: Critical.

---

### TC-7.3 — Wizard cancel

**Steps**

1. Open wizard.
2. Click **Cancel** or press **Esc**.

**UI verification**

- Wizard removes from DOM (no `<div data-testid="create-board-wizard">`).

**Pass criteria**: nothing posted; no record created.

**Severity if failing**: Medium.

---

### TC-7.4 — Board view header and toolbar

**Steps**

1. Navigate to `/boards/{id}` of a board with at least one tag.

**UI verification**

- Header `<header data-testid="board-view-header">` with `<h1>{name}</h1>` and optional description (`board-view.html:2-6`).
- Toolbar contains tag-filter chips: each `<button class="filter-chip" [data-testid]="board-tag-filter-{name}">` shows text **`Tag={tag.name}`**. When active, gets `filter-chip--active`.
- **Show archived** toggle: `<button data-testid="board-show-archived" class="filter-chip">Show archived</button>`.

**Pass criteria**: chips render with the `Tag={name}` literal prefix exactly.

**Severity if failing**: High.

---

### TC-7.5 — Columns view renders cards

**Steps**

1. On a board with cards, observe column structure.

**UI verification**

- Columns container `<div data-testid="board-view-columns" class="columns">` (`board-view.html:36`) when `swimlaneMode() === 'None'`.
- Each column `<section data-testid="board-column-{name}">` with header showing **name** and a count.
- Count format: `{n} / {wipLimit}` if WIP set; else just `{n}`.
- Over-limit columns get `column--over-limit` class and `data-over-limit="true"` attribute.
- Each card `<li data-testid="board-card-{title}" draggable="true">` with title, tag chips (`data-testid="card-tag"`), assignee initials (`data-testid="card-assignee"`), due date (`data-testid="card-due-date"`).
- Pagination dots `<div data-testid="board-column-indicators">` shown when `b.columns.length > 1`.

**Pass criteria**: structure exact.

**Severity if failing**: High.

---

### TC-7.6 — Add card via the column footer

**Steps**

1. In any column click **+ Add card** if the control is present.

**Current code verification**

- Backend supports `POST /api/v1/boards/{id}/cards`.
- `board-view.html` currently does not render a visible Add Card control.

**Pass criteria**: current UI has no Add Card entry point. Mark blocked/failed against the product requirement if adding cards from the board is required.

**Severity if failing**: High.

---

### TC-7.7 — Drag-and-drop a card between columns

**Steps**

1. Click and hold a card.
2. Drag to another column. A drop indicator visualizes target.
3. Release.

**UI verification**

- Cards have `draggable="true"` (`board-view.html:62`).
- Columns handle `(dragover)`, `(drop)`.

**Behavior verification**

- API: `POST /api/v1/cards/{id}/move` with `{ targetColumnId }`.
- Optimistic UI: card moves immediately; on error rolls back (verify via toast).

**State/API verification**

- `KanbanDbContext.Cards.ColumnId` is updated.

**Pass criteria**: drop succeeds; persists.

**Severity if failing**: Critical.

---

### TC-7.8 — Mobile move-sheet

**Steps**

1. On xs viewport tap a card.
2. Open the move sheet using the board's mobile long-press/tap behavior.

**Current code verification**

- `card-detail-dialog.html` does not contain a Move button.
- `board-view.ts` opens `BoardMoveSheetDialog` from card pointer interactions.

**UI verification**

- Backdrop `<div class="move-sheet-backdrop">` (`board-view.html:157`).
- Sheet `<div data-testid="board-move-sheet" role="dialog" aria-modal="true">` with title **"Move to..."**.
- Each option `<button data-testid="board-move-sheet-option-{name}">{name}</button>`.

**Pass criteria**: sheet shows columns other than current; tapping moves card.

**Severity if failing**: High.

---

### TC-7.9 — WIP limit warning

**Steps**

1. Configure a column with `wipLimit=2`.
2. Add 2 cards.
3. Attempt to drag a 3rd card in.

**UI verification**

- Column count display switches to `{n} / {limit}` and gains `column--over-limit` class.
- Per user guide §7.5: warning shown before move accepted. Verify the warning surface — toast or inline confirmation.

**Pass criteria**: warning visible; move only completes after acknowledgment.

**Severity if failing**: High.

---

### TC-7.10 — Card detail dialog

**Steps**

1. Click any card.

**UI verification**

- `<div data-testid="card-detail-dialog" role="dialog" aria-modal="true">` (`card-detail-dialog.html:1`).
- Header has an editable title `<input data-testid="card-detail-title">` — saves on blur.
- Header actions: **Archive** (`data-testid="card-detail-archive"`, `btn-text`), **Delete** (`data-testid="card-detail-delete"`, `btn-text--danger`), **Close** (`data-testid="card-detail-close"`, `btn-icon`, glyph `×`, `aria-label="Close"`).
- Details section heading **"Details"** with one input per schema field (`data-testid="card-detail-field-{key}"`). Required fields show `*`.
- Comments section heading **"Comments"** with list and a textarea + **Add** button (`data-testid="card-detail-comment-add"`, `btn-filled`).
- Attachments section heading **"Attachments"** with file input `data-testid="card-detail-attachment-input"` accepting `application/pdf,image/*`.

**Pass criteria**: structure and copy exact.

**Severity if failing**: High.

---

### TC-7.11 — Archive card

**Steps**

1. Open card detail.
2. Click **Archive**.

**UI verification**

- Dialog closes; card disappears from default board view; reappears with **Show archived** toggle on.

**Behavior verification**

- Current frontend sends `PATCH /api/v1/cards/{id}` with `{ archived: true }`.
- Current backend `PatchCardHandler` updates `title`, `assigneeName`, and `dueDate`; it does not persist `archived`.

**Pass criteria**: current implementation does not persist card archival. Mark blocked/failed if archived cards are required.

**Severity if failing**: High.

---

### TC-7.12 — Delete card

**Steps**

1. Open card detail.
2. Click **Delete**.

**UI verification**

- Confirmation via `tar-confirm-dialog` (rendered from `app.html:3`).
- Card removed permanently.

**Behavior verification**

- Current backend has no `DELETE /api/v1/cards/{id}` endpoint in `CardsController`.
- Current frontend calls `DELETE /api/v1/cards/{id}` after removing the card optimistically.

**Pass criteria**: current implementation is incomplete. Mark blocked/failed until the backend delete endpoint is implemented.

**Severity if failing**: Critical.

---

### TC-7.13 — Configure board: rename and reorder columns

**Steps**

1. Open `/boards/{id}/configure`.
2. Drag a column row by its handle.

**UI verification**

- Heading **`Configure: {name}`** (`board-configure.html:3`).
- Section **"Swimlanes"** with a `Group by` select (`data-testid="board-configure-swimlane-select"`) options: **None**, **Assignee**, **Priority**.
- Column rows `<li data-testid="config-column-row-{name}" draggable="true">` with handle glyph `::`, name, **`{n} cards`** count, **Delete** button (`data-testid="config-column-delete-{name}"`, `btn-text`).

**Pass criteria**: drag reorders persistently.

**Severity if failing**: High.

---

### TC-7.14 — Configure: delete column triggers move-cards dialog

**Steps**

1. Click **Delete** on a column that contains cards.

**UI verification**

- Dialog `<div data-testid="config-move-cards-dialog" role="dialog" aria-modal="true">` (`board-configure.html:51-74`).
- Title: **`Move {n} cards from "{name}" to...`**.
- Select `data-testid="config-move-cards-target"` lists other columns.
- Buttons: **Cancel** (`btn-text`) and **Confirm** (`data-testid="config-move-cards-confirm"`, `btn-filled`).

**Pass criteria**: dialog opens, cards moved on Confirm, source column removed.

**Severity if failing**: Critical (data loss risk if cards orphaned).

---

### TC-7.15 — Swimlanes view groups by lane

**Steps**

1. In configure, set `Group by = Assignee` (or use the toolbar toggle if present).
2. Return to board.

**UI verification**

- Container `<div class="swimlanes">` (`board-view.html:105`).
- Each lane `<div data-testid="board-swimlane-{lane}">` with header label (or **Unassigned** if empty).
- Cards live inside `<section data-testid="board-column-{name}">` per lane.
- Drop target binds `(drop)="onDrop($event, column, lane)"` so dragging into a lane updates assignee.

**Pass criteria**: cards grouped correctly; dragging into a lane reassigns.

**Severity if failing**: High.

---

### TC-7.16 — Tag filter narrows visible cards

**Steps**

1. On a board with multiple tags, click any tag chip in the toolbar.

**UI verification**

- Chip becomes active (`filter-chip--active`).
- Only cards with that tag remain visible.

**Pass criteria**: filter applies; clearing the chip restores all cards.

**Severity if failing**: Medium.

---

### TC-7.17 — Show archived chip

**Steps**

1. Toggle **Show archived** on a board with archived cards.

**UI verification**

- Chip activates; archived cards reappear (visually distinguished).

**Pass criteria**: state toggles correctly.

**Severity if failing**: Medium.
