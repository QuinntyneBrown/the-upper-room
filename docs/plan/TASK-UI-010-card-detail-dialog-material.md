# TASK-UI-010 — Migrate `card-detail-dialog.html` to Angular Material / Component Library

**Status:** Accepted  
**Priority:** P2  
**Effort:** Medium (1–2 days)  
**File:** `frontend/projects/the-upper-room/src/app/kanban/card-detail-dialog/card-detail-dialog.html`

---

## Problem

`card-detail-dialog.html` is a fully custom inline overlay dialog. It uses raw inputs, a textarea, multiple buttons, and a custom div-based dialog shell — none of which use Angular Material or `components` library components.

## Non-Compliant Elements Found

### Dialog Shell → `MatDialog`
```html
<!-- Current -->
<div data-testid="card-detail-dialog" class="dialog-overlay" role="dialog" aria-modal="true">
  <div class="dialog">...</div>
</div>

<!-- Required -->
<!-- Component opened via MatDialog.open() — dialog shell removed from template -->
<!-- Template becomes the mat-dialog content directly -->
```

### Title Input (inline editable heading)
```html
<!-- Current -->
<input type="text" class="dialog__title" [value]="currentTitle()" (input)="currentTitle.set(...)" (blur)="onTitleBlur()" />

<!-- Required -->
<tar-text-field
  testId="card-detail-title"
  [value]="currentTitle()"
  (valueChange)="currentTitle.set($event)"
  (blurred)="onTitleBlur()"
/>
```
*Or use `matInput` inside a `mat-form-field` directly if `tar-text-field` blur output isn't available.*

### Header Action Buttons
```html
<!-- Current -->
<button class="btn-text" (click)="onArchive()">Archive</button>
<button class="btn-text btn-text--danger" (click)="onDelete()">Delete</button>
<button class="btn-icon" aria-label="Close" (click)="onClose()">×</button>

<!-- Required -->
<tar-button variant="text" testId="card-detail-archive" (clicked)="onArchive()">Archive</tar-button>
<tar-button variant="text" color="warn" testId="card-detail-delete" (clicked)="onDelete()">Delete</tar-button>
<tar-icon-button icon="close" ariaLabel="Close" testId="card-detail-close" (clicked)="onClose()" />
```

### Schema Field Inputs (dynamic, per field)
```html
<!-- Current -->
<input class="dialog__input" type="text" [value]="fieldValue(field.key)" (input)="onFieldInput(field.key, $any($event.target).value)" />
<span class="dialog__field-error">{{ err }}</span>

<!-- Required -->
<tar-text-field
  [testId]="'card-detail-field-' + field.key"
  [label]="field.label"
  [required]="field.required"
  [value]="fieldValue(field.key)"
  [error]="fieldErrors()[field.key]"
  (valueChange)="onFieldInput(field.key, $event)"
/>
```

### Comment Textarea
```html
<!-- Current -->
<textarea class="dialog__input" rows="2" [value]="newComment()" ...></textarea>
<button class="btn-filled" (click)="addComment()">Add</button>

<!-- Required -->
<tar-textarea
  testId="card-detail-comment-input"
  [rows]="2"
  [value]="newComment()"
  (valueChange)="newComment.set($event)"
/>
<tar-button variant="filled" testId="card-detail-comment-add" (clicked)="addComment()">Add</tar-button>
```

### File Input (attachments)
The `<input type="file">` is a special case — Angular Material does not have a native file-input component. Keep as a raw `<input type="file">` but ensure it is properly labeled with `aria-label`. This is acceptable.

## Acceptance Criteria

- [ ] Dialog opened via `MatDialog` — remove inline overlay div
- [ ] Title input → `tar-text-field` (or `matInput` in `mat-form-field`) with blur event preserved
- [ ] Archive/Delete buttons → `tar-button` with appropriate variant and color
- [ ] Close button → `tar-icon-button icon="close"`
- [ ] Schema field inputs (dynamic) → `tar-text-field` with per-field error binding
- [ ] Comment textarea → `tar-textarea`
- [ ] Add comment button → `tar-button variant="filled"`
- [ ] File input stays as raw `<input type="file">` (acceptable exception)
- [ ] `data-testid` attributes preserved for all interactive elements
- [ ] `onClose()` triggers `MatDialogRef.close()` when converted to `MatDialog`

## Notes

- When migrating to `MatDialog`, inject `MatDialogRef<CardDetailDialogComponent>` and replace `onClose()` with `this.dialogRef.close()`.
- The title input is unusual — it's a styled editable heading, not a standard form field. Ensure the `tar-text-field` appearance is set correctly or use a bare `matInput` with custom styling to preserve the heading aesthetic.
- The `onTitleBlur()` call saves the title — `tar-text-field` exposes a `(blurred)` output for this.
