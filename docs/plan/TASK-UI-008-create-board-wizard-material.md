# TASK-UI-008 — Migrate `create-board-wizard.html` to Angular Material / Component Library

**Status:** Draft  
**Priority:** P2  
**Effort:** Small (< 1 day)  
**File:** `frontend/projects/the-upper-room/src/app/kanban/create-board-wizard/create-board-wizard.html`

---

## Problem

`create-board-wizard.html` is a small form rendered as a custom div-based overlay dialog. All form controls and buttons use raw HTML with custom CSS classes instead of the `components` library wrappers.

## Non-Compliant Elements Found

### Dialog Shell
```html
<!-- Current -->
<div class="wizard-overlay" role="dialog" aria-modal="true" aria-labelledby="create-board-title">
  <form class="wizard" ...>...</form>
</div>

<!-- Required -->
<!-- Use tar-dialog component or open via MatDialog -->
<!-- The wizard should be launched via MatDialog.open() in the component class -->
```

### Name Input
```html
<!-- Current -->
<label class="wizard__field">
  <span class="wizard__label">Name</span>
  <input class="wizard__input" type="text" required [value]="name()" ... />
</label>

<!-- Required -->
<tar-text-field
  label="Name"
  testId="create-board-name"
  [required]="true"
  [value]="name()"
  (valueChange)="name.set($event)"
/>
```

### Description Textarea
```html
<!-- Current -->
<textarea class="wizard__input" rows="3" [value]="description()" ...></textarea>

<!-- Required -->
<tar-textarea
  label="Description"
  testId="create-board-description"
  [rows]="3"
  [value]="description()"
  (valueChange)="description.set($event)"
/>
```

### Default Columns Checkbox
```html
<!-- Current -->
<label class="wizard__field wizard__field--inline">
  <input type="checkbox" [checked]="defaultColumns()" (change)="defaultColumns.set($any($event.target).checked)" />
  <span>Create with default columns (To do, In progress, Done)</span>
</label>

<!-- Required -->
<tar-checkbox
  testId="create-board-default-columns"
  [checked]="defaultColumns()"
  (checkedChange)="defaultColumns.set($event)"
>
  Create with default columns (To do, In progress, Done)
</tar-checkbox>
```

### Action Buttons
```html
<!-- Current -->
<button class="btn-text" (click)="onCancel()">Cancel</button>
<button class="btn-filled" type="submit">Create</button>

<!-- Required -->
<tar-button variant="text" testId="create-board-cancel" (clicked)="onCancel()">Cancel</tar-button>
<tar-button variant="filled" testId="create-board-submit" type="submit">Create</tar-button>
```

## Acceptance Criteria

- [ ] Dialog shell → `tar-dialog` component or `MatDialog`-based opening
- [ ] Name input → `tar-text-field` with `required`, `testId`
- [ ] Description → `tar-textarea` with `rows`, `testId`
- [ ] Default columns checkbox → `tar-checkbox`
- [ ] Cancel/Create buttons → `tar-button` with correct `variant`
- [ ] All `data-testid` attributes preserved via `testId` inputs
- [ ] Form submit (`onSubmit`) and cancel (`onCancel`) still work
- [ ] ARIA attributes (`role="dialog"`, `aria-modal`, `aria-labelledby`) handled by `tar-dialog` or preserved manually

## Notes

- If converting to `MatDialog`, the component class needs to inject `MatDialog` and the wizard markup moves into the `mat-dialog-content` / `mat-dialog-actions` pattern.
- If keeping as an inline overlay, wrap content in `tar-dialog` and remove the custom overlay div.
- The wizard is relatively simple (3 fields + 2 buttons) — the `MatDialog` approach will be cleaner long-term as it handles keyboard trapping and backdrop click dismissal automatically.
