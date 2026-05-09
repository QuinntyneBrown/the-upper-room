# TASK-UI-009 — Migrate `board-configure.html` to Angular Material / Component Library

**Status:** Accepted  
**Priority:** P2  
**Effort:** Small (< 1 day)  
**File:** `frontend/projects/the-upper-room/src/app/kanban/board-configure/board-configure.html`

---

## Problem

`board-configure.html` uses raw selects and buttons in both the main config view and an inline "move cards" dialog that appears when deleting a column.

## Non-Compliant Elements Found

### Swimlane Group-By Select
```html
<!-- Current -->
<label class="config-label">
  Group by
  <select class="config-select" [value]="swimlaneMode()" (change)="onSwimlaneChange($any($event.target).value)">
    <option value="None">None</option>
    <option value="Assignee">Assignee</option>
    <option value="Priority">Priority</option>
  </select>
</label>

<!-- Required -->
<tar-select
  label="Group by"
  testId="board-configure-swimlane-select"
  [value]="swimlaneMode()"
  [options]="swimlaneModeOptions"
  (valueChange)="onSwimlaneChange($event)"
/>
```
*`swimlaneModeOptions = [{ label: 'None', value: 'None' }, { label: 'Assignee', value: 'Assignee' }, { label: 'Priority', value: 'Priority' }]`*

### Column Delete Button (per row)
```html
<!-- Current -->
<button class="btn-text" (click)="onDeleteColumn(column)">Delete</button>

<!-- Required -->
<tar-button variant="text" [testId]="'config-column-delete-' + column.name" (clicked)="onDeleteColumn(column)">Delete</tar-button>
```

### Inline Move-Cards Dialog → `tar-dialog` or `MatDialog`
```html
<!-- Current -->
<div class="dialog-overlay" role="dialog" aria-modal="true">
  <div class="dialog">
    <h2>Move {{ cardsInDeleteTarget() }} cards from "{{ target.name }}" to...</h2>
    <select class="dialog__input" [value]="moveCardsTo()" ...>
      @for (col of otherColumns(); track col.id) { <option [value]="col.id">{{ col.name }}</option> }
    </select>
    <div class="dialog__actions">
      <button class="btn-text" (click)="cancelMove()">Cancel</button>
      <button class="btn-filled" (click)="confirmMove()">Confirm</button>
    </div>
  </div>
</div>
```

**Required:** Extract the move-cards dialog to a `MatDialog` component. The inline overlay is replaced by `MatDialog.open()` in `onDeleteColumn()`.

The move-cards dialog component should use:
- `<h2 mat-dialog-title>` for the title
- `<mat-dialog-content>` wrapping a `tar-select` for the target column
- `<mat-dialog-actions>` with `tar-button` for Cancel/Confirm

## Acceptance Criteria

- [ ] Swimlane select → `tar-select` with `swimlaneModeOptions` array
- [ ] Column-delete buttons (per row) → `tar-button variant="text"` with `testId`
- [ ] Inline move-cards dialog → extracted `MatDialog` component
- [ ] Move-cards target select (inside dialog) → `tar-select` with `otherColumns` mapped to options
- [ ] Cancel/Confirm buttons in dialog → `tar-button`
- [ ] `data-testid="config-move-cards-dialog"` and `data-testid="config-move-cards-target"` preserved
- [ ] Drag-and-drop column reordering (`draggable`, `dragstart`, `dragover`, `drop`) unchanged

## Notes

- `otherColumns` is a signal — map it to `{ label: col.name, value: col.id }[]` options in the component class.
- The move-cards dialog needs access to `otherColumns()` and must emit the chosen target back — pass data via `MatDialog` injection token and return via `dialogRef.close(result)`.
