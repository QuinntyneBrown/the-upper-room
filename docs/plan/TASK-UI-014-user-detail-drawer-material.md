# TASK-UI-014 — Migrate `user-detail-drawer.html` (domain) to Angular Material / Component Library

**Status:** Complete  
**Priority:** P1  
**Effort:** Small (< 1 day)  
**File:** `frontend/projects/domain/src/lib/users/user-detail-drawer/user-detail-drawer.html`

---

## Problem

`user-detail-drawer.html` is a domain library component used globally (rendered in `user-list.html`). It uses raw buttons with custom classes and a raw select for role assignment — bypassing `tar-button`, `tar-icon-button`, and `tar-select`.

## Non-Compliant Elements Found

### Close Icon Button (header)
```html
<!-- Current -->
<button type="button" class="icon-btn" aria-label="Close" (click)="closed.emit()">×</button>

<!-- Required -->
<tar-icon-button
  testId="user-drawer-close"
  icon="close"
  ariaLabel="Close"
  (clicked)="closed.emit()"
/>
```

### Role Select
```html
<!-- Current -->
<select [value]="u.role" (change)="onRole($any($event.target).value)">
  @for (r of roles; track r) { <option [value]="r">{{ r }}</option> }
</select>

<!-- Required -->
<tar-select
  testId="user-drawer-role-select"
  [value]="u.role"
  [options]="roleOptions"
  (valueChange)="onRole($event)"
/>
```
*`roleOptions` computed in component: `roles.map(r => ({ label: r, value: r }))`*

### Action Buttons (Reset password, Disable, Delete)
```html
<!-- Current -->
<button class="btn btn--ghost" (click)="resetPasswordRequested.emit(u)">Reset password</button>
<button class="btn btn--ghost" (click)="disableRequested.emit(u)">Disable</button>
<button class="btn btn--danger" (click)="deleteRequested.emit(u)">Delete</button>

<!-- Required -->
<tar-button variant="outlined" testId="user-drawer-reset-password" (clicked)="resetPasswordRequested.emit(u)">
  Reset password
</tar-button>
<tar-button variant="outlined" testId="user-drawer-disable" (clicked)="disableRequested.emit(u)">
  Disable
</tar-button>
<tar-button variant="filled" color="warn" testId="user-drawer-delete" (clicked)="deleteRequested.emit(u)">
  Delete
</tar-button>
```

## Acceptance Criteria

- [x] Close button (`icon-btn`) → `tar-icon-button icon="close"`
- [x] Role select → `tar-select` with computed `roleOptions`
- [x] Reset password button → `tar-button variant="outlined"`
- [x] Disable button → `tar-button variant="outlined"` (inside `@if (!isSelf())` guard — preserve)
- [x] Delete button → `tar-button` with destructive styling (inside `@if (!isSelf())` guard — preserve)
- [x] All `data-testid` attributes preserved via `testId` inputs
- [x] `closed`, `disableRequested`, `roleChanged`, `resetPasswordRequested`, `deleteRequested` outputs still emit

## Notes

- This is a **domain library** component — run the full user management flow (open drawer, change role, disable user) after migrating.
- `roleOptions` should be a computed getter, not inline in the template.
- The `isSelf()` guard preventing self-disable/delete must be preserved exactly.
- Check whether `tar-button color="warn"` is supported — look at `button.html` in the components library. If not, use the variant that closest represents a destructive action.
