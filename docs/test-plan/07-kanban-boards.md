# Section 7 — Kanban Boards

> Mirrors `docs/user-guide.md` §7.

## Pre-conditions

- Signed in.
- For configure tests: user has `KanbanBoard:Configure` (route guard at `frontend/projects/the-upper-room/src/app/app.routes.ts:88-93`).
- Backend `Boards` list (`backend/src/TheUpperRoom.Api/Kanban/BoardsController.cs:11`) initially empty.

## Tests

### TC-7.1 — Board list (empty state)

**Steps**

1. Navigate to `/boards`.

**UI verification**

- Toolbar `<div class="toolbar">` with `<h1 class="page-title">Boards</h1>` (`board-list.html:1-3`).
- Empty state `<div data-testid="boards-empty-state">` rendering `tar-empty-state` with `icon="view_kanban"`, `heading="No boards yet"`, `body="Create a board to organize your work."` (lines 11-23).
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
- Heading **"New board"** (line 3).
- Field 1: label **"Name"**, `data-testid="create-board-name"`, required (lines 4-14).
- Field 2: label **"Description"**, textarea, `data-testid="create-board-description"` (lines 15-24).
- Checkbox: text **"Create with default columns (To do, In progress, Done)"**, `data-testid="create-board-default-columns"` (lines 25-33).
- Buttons: **Cancel** (`data-testid="create-board-cancel"`, `btn-text`) and **Create** (`data-testid="create-board-submit"`, `btn-filled`) (lines 34-41).

**Behavior verification**

- API: `POST /api/v1/boards` body `{ "name": "Sprint 1", "description": "...", "defaultColumns": true }` (`BoardsController.cs:42-62`).
- Returns `201 Created` with `{ id, name, description, columnCount, cardCount, lastActivityAt }`. With `defaultColumns=true`, `columnCount` is **3** (line 56). Otherwise **0**.
- Frontend transitions into the new board view.

**Database verification**

- `Boards` static list (`BoardsController.cs:11`) has the new entry.

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
- Toolbar contains tag-filter chips: each `<button class="filter-chip" [data-testid]="board-tag-filter-{name}">` shows text **`Tag={tag.name}`** (lines 11-21). When active, gets `filter-chip--active`.
- **Show archived** toggle: `<button data-testid="board-show-archived" class="filter-chip">Show archived</button>` (lines 23-31).

**Pass criteria**: chips render with the `Tag={name}` literal prefix exactly.

**Severity if failing**: High.

---

### TC-7.5 — Columns view renders cards

**Steps**

1. On a board with cards, observe column structure.

**UI verification**

- Columns container `<div data-testid="board-view-columns" class="columns">` (`board-view.html:36`) when `swimlaneMode() === 'None'`.
- Each column `<section data-testid="board-column-{name}">` (line 39) with header showing **name** and a count.
- Count format: `{n} / {wipLimit}` if WIP set; else just `{n}` (lines 49-53).
- Over-limit columns get `column--over-limit` class and `data-over-limit="true"` attribute (lines 41-44).
- Each card `<li data-testid="board-card-{title}" draggable="true">` (line 58) with title, tag chips (`data-testid="card-tag"`), assignee initials (`data-testid="card-assignee"`), due date (`data-testid="card-due-date"`).
- Pagination dots `<div data-testid="board-column-indicators">` shown when `b.columns.length > 1` (lines 91-103).

**Pass criteria**: structure exact.

**Severity if failing**: High.

---

### TC-7.6 — Add card via the column footer

**Steps**

1. In any column click **+ Add card** (per user guide §7.4 — verify in `board-view.html` for the actual control; **[unverified — no `+ Add card` button is currently rendered in `board-view.html`. The user guide §7.4 promises it. File a defect or update the guide.]**)

**Pass criteria (when implemented)**: card created, appears in column, audit entry added.

**Severity if failing**: High.

---

### TC-7.7 — Drag-and-drop a card between columns

**Steps**

1. Click and hold a card.
2. Drag to another column. A drop indicator visualizes target.
3. Release.

**UI verification**

- Cards have `draggable="true"` (`board-view.html:62`).
- Columns handle `(dragover)`, `(drop)` (lines 43-44).

**Behavior verification**

- API: `PATCH /api/v1/cards/{id}` (or equivalent in `backend/src/TheUpperRoom.Api/Kanban/CardsController.cs`) with new `columnId`.
- Optimistic UI: card moves immediately; on error rolls back (verify via toast).

**Database verification**

- Card's `ColumnId` field updated in the static store (file: `CardsController.cs`).

**Pass criteria**: drop succeeds; persists.

**Severity if failing**: Critical.

---

### TC-7.8 — Mobile move-sheet

**Steps**

1. On xs viewport tap a card.
2. The card detail dialog opens; tap **Move** (per user guide §7.5). **[unverified — `card-detail-dialog.html` does not contain a Move button; on the board, a long-press triggers `onCardPointerDown` which presumably opens the sheet (`board-view.html:64`). Verify the open-trigger.]**

**UI verification**

- Backdrop `<div class="move-sheet-backdrop">` (`board-view.html:157`).
- Sheet `<div data-testid="board-move-sheet" role="dialog" aria-modal="true">` (line 158) with title **"Move to..."** (line 159).
- Each option `<button data-testid="board-move-sheet-option-{name}">{name}</button>` (lines 163-167).

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
- Header has an editable title `<input data-testid="card-detail-title">` (line 4-11) — saves on blur.
- Header actions (lines 13-16): **Archive** (`data-testid="card-detail-archive"`, `btn-text`), **Delete** (`data-testid="card-detail-delete"`, `btn-text--danger`), **Close** (`data-testid="card-detail-close"`, `btn-icon`, glyph `×`, `aria-label="Close"`).
- Details section heading **"Details"** (line 21) with one input per schema field (`data-testid="card-detail-field-{key}"`). Required fields show `*`.
- Comments section heading **"Comments"** (line 43) with list and a textarea + **Add** button (`data-testid="card-detail-comment-add"`, `btn-filled`).
- Attachments section heading **"Attachments"** (line 64) with file input `data-testid="card-detail-attachment-input"` accepting `application/pdf,image/*`.

**Pass criteria**: structure and copy exact.

**Severity if failing**: High.

---

### TC-7.11 — Archive card

**Steps**

1. Open card detail.
2. Click **Archive**.

**UI verification**

- Dialog closes; card disappears from default board view; reappears with **Show archived** toggle on.

**Pass criteria**: archival reflected.

**Severity if failing**: High.

---

### TC-7.12 — Delete card

**Steps**

1. Open card detail.
2. Click **Delete**.

**UI verification**

- Confirmation via `tar-confirm-dialog` (rendered from `app.html:3`).
- Card removed permanently.

**Behavior verification**: `DELETE /api/v1/cards/{id}` returns `204`.

**Pass criteria**: deletion irreversible.

**Severity if failing**: Critical.

---

### TC-7.13 — Configure board: rename and reorder columns

**Steps**

1. Open `/boards/{id}/configure`.
2. Drag a column row by its handle.

**UI verification**

- Heading **`Configure: {name}`** (`board-configure.html:3`).
- Section **"Swimlanes"** with a `Group by` select (`data-testid="board-configure-swimlane-select"`) options: **None**, **Assignee**, **Priority** (lines 6-21).
- Column rows `<li data-testid="config-column-row-{name}" draggable="true">` (lines 24-32) with handle glyph `::`, name, **`{n} cards`** count, **Delete** button (`data-testid="config-column-delete-{name}"`, `btn-text`).

**Pass criteria**: drag reorders persistently.

**Severity if failing**: High.

---

### TC-7.14 — Configure: delete column triggers move-cards dialog

**Steps**

1. Click **Delete** on a column that contains cards.

**UI verification**

- Dialog `<div data-testid="config-move-cards-dialog" role="dialog" aria-modal="true">` (`board-configure.html:51-74`).
- Title: **`Move {n} cards from "{name}" to...`** (line 53-54).
- Select `data-testid="config-move-cards-target"` lists other columns (line 57-65).
- Buttons: **Cancel** (`btn-text`) and **Confirm** (`data-testid="config-move-cards-confirm"`, `btn-filled`) (lines 67-72).

**Pass criteria**: dialog opens, cards moved on Confirm, source column removed.

**Severity if failing**: Critical (data loss risk if cards orphaned).

---

### TC-7.15 — Swimlanes view groups by lane

**Steps**

1. In configure, set `Group by = Assignee` (or use the toolbar toggle if present).
2. Return to board.

**UI verification**

- Container `<div class="swimlanes">` (`board-view.html:105`).
- Each lane `<div data-testid="board-swimlane-{lane}">` (line 107) with header label (or **Unassigned** if empty, line 109).
- Cards live inside `<section data-testid="board-column-{name}">` per lane.
- Drop target binds `(drop)="onDrop($event, column, lane)"` (line 117) so dragging into a lane updates assignee.

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
