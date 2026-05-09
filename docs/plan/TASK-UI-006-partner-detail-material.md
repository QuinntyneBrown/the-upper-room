# TASK-UI-006 — Migrate `partner-detail.html` to Angular Material / Component Library

**Status:** Draft  
**Priority:** P2  
**Effort:** Medium (1–2 days)  
**File:** `frontend/projects/the-upper-room/src/app/partners/partner-detail/partner-detail.html`

---

## Problem

`partner-detail.html` has three distinct problems: raw action buttons in the header, a custom inline delete-confirmation dialog with raw inputs and buttons, and a custom tab navigation bar built from raw `<nav>` and `<button>` elements.

## Non-Compliant Elements Found

### Header Action Buttons
```html
<!-- Current -->
<a class="btn-outlined" [href]="'/partners/' + p.id + '/edit'">Edit</a>
<button class="btn-outlined" (click)="archive()">Archive</button>
<button class="btn-outlined" (click)="archive()">Restore</button>
<button class="btn-danger" (click)="openDeleteDialog()">Delete</button>

<!-- Required -->
<tar-button variant="outlined" routerLink="/partners/{{ p.id }}/edit">Edit</tar-button>
<tar-button variant="outlined" (clicked)="archive()">Archive</tar-button>
<tar-button variant="outlined" (clicked)="archive()">Restore</tar-button>
<tar-button variant="filled" color="warn" (clicked)="openDeleteDialog()">Delete</tar-button>
```

### Icon Span (website link)
```html
<!-- Current -->
<span class="material-symbols-outlined">open_in_new</span>

<!-- Required -->
<mat-icon>open_in_new</mat-icon>
```

### Tab Navigation
```html
<!-- Current -->
<nav class="partner-tabs" role="tablist">
  <button class="partner-tabs__tab" [class.partner-tabs__tab--active]="activeTab() === 'overview'" ...>Overview</button>
  <button class="partner-tabs__tab" ...>Contacts</button>
  <button class="partner-tabs__tab" ...>Activity</button>
</nav>

<!-- Required -->
<tar-tabs
  [tabs]="[{label:'Overview',value:'overview'},{label:'Contacts',value:'contacts'},{label:'Activity',value:'activity'}]"
  [activeTab]="activeTab()"
  (tabChange)="activeTab.set($event)"
/>
```

### Inline Delete Dialog → `MatDialog` or `tar-dialog`

The inline `<div class="dialog-backdrop">` block contains:
- Raw `<input class="dialog__input">` for delete confirmation text
- Raw `<button class="btn-outlined">` (Cancel) and `<button class="btn-danger">` (Delete/Archive instead)

**Recommended approach:** Extract the delete-confirm dialog into a separate component and open it via `MatDialog`, or use the existing `tar-confirm-dialog` component if the confirmation-name pattern fits.

```html
<!-- Current (inline) -->
<div class="dialog-backdrop" (click)="closeDeleteDialog()">
  <div class="dialog">
    <input class="dialog__input" type="text" ... />
    <div class="dialog__actions">
      <button class="btn-outlined" (click)="closeDeleteDialog()">Cancel</button>
      <button class="btn-danger" [disabled]="..." (click)="confirmDelete()">Delete</button>
    </div>
  </div>
</div>

<!-- Required -->
<!-- Open via MatDialog or tar-confirm-dialog in component class -->
<!-- Remove the inline dialog block from the template entirely -->
```

## Acceptance Criteria

- [ ] Header Edit link → `tar-button variant="outlined"` with `routerLink`
- [ ] Archive/Restore buttons → `tar-button variant="outlined"`
- [ ] Delete button → `tar-button` with destructive styling
- [ ] `<span class="material-symbols-outlined">` → `<mat-icon>`
- [ ] Tab navigation → `tar-tabs` component
- [ ] Inline delete dialog extracted to `MatDialog` or `tar-confirm-dialog`
- [ ] Delete dialog input (type partner name) and actions use `tar-text-field` and `tar-button`
- [ ] `showDeleteDialog()` signal replaced by `MatDialog` open/close lifecycle

## Notes

- Check whether `tar-confirm-dialog` (`frontend/projects/components/src/lib/confirm-dialog/tar-confirm-dialog.html`) already handles the "type the name to confirm" pattern. If not, create a `DeletePartnerDialogComponent` opened via `MatDialog`.
- The "Archive instead" fallback path in the dialog must also be preserved.
- Tab panel `role="tabpanel"` and ARIA attributes should be handled by `tar-tabs` internally — verify before removing manual ARIA from templates.
