# TASK-UI-011 — Migrate `user-list.html` to Angular Material / Component Library

**Status:** Accepted  
**Priority:** P2  
**Effort:** Small (< 1 day)  
**File:** `frontend/projects/the-upper-room/src/app/users/user-list/user-list.html`

---

## Problem

`user-list.html` already uses several `tar-*` components correctly (`tar-button`, `tar-search-field`, `tar-empty-state`, `tar-invite-user-dialog`, `tar-user-detail-drawer`). However, the role filter chips, the page-size select, and the data table still use raw HTML elements.

## Non-Compliant Elements Found

### Role Filter Chips → `mat-chip-listbox` or `tar-chip-set`
```html
<!-- Current -->
<div class="user-list__chips">
  @for (r of roles; track r) {
    <button
      [attr.data-testid]="'user-filter-' + r"
      type="button"
      class="user-list__chip"
      [class.user-list__chip--active]="roleFilter() === r"
      (click)="onRole(r)"
    >{{ r }}</button>
  }
</div>

<!-- Required: use tar-chip-set or mat-chip-listbox -->
<mat-chip-listbox
  class="user-list__chips"
  [value]="roleFilter()"
  (change)="onRole($event.value)"
>
  @for (r of roles; track r) {
    <mat-chip-option [attr.data-testid]="'user-filter-' + r" [value]="r">{{ r }}</mat-chip-option>
  }
</mat-chip-listbox>
```
*Check the existing `tar-chip-set` component (`frontend/projects/components/src/lib/chip/chip-set.html`) — if it supports selectable/toggle mode, prefer `tar-chip-set` over raw `mat-chip-listbox`.*

### Page-Size Select → `tar-select`
```html
<!-- Current -->
<select class="user-list__paginator-select" [value]="pageSize()" (change)="onPageSize($any($event.target).value)">
  <option value="25">25</option>
  <option value="50">50</option>
  <option value="100">100</option>
</select>

<!-- Required -->
<tar-select
  testId="user-page-size"
  [value]="pageSize()"
  [options]="[{label:'25',value:'25'},{label:'50',value:'50'},{label:'100',value:'100'}]"
  (valueChange)="onPageSize($event)"
/>
```

### Raw Table → `mat-table`
```html
<!-- Current -->
<table class="user-list__table">
  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>City</th><th>Status</th><th>Last sign-in</th></tr></thead>
  <tbody>
    @for (u of users(); track u.id) {
      <tr class="user-list__row" (click)="selectUser(u)">
        <td>{{ u.name }}</td>...
      </tr>
    }
  </tbody>
</table>

<!-- Required: mat-table -->
<table mat-table [dataSource]="users()" class="user-list__table">
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef>Name</th>
    <td mat-cell *matCellDef="let u">{{ u.name }}</td>
  </ng-container>
  <!-- repeat for email, role, city, status, lastSignIn -->
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"
      [attr.data-testid]="'user-row-' + row.email"
      class="user-list__row"
      (click)="selectUser(row)"
  ></tr>
</table>
```
*Add `displayedColumns = ['name', 'email', 'role', 'city', 'status', 'lastSignIn']` to component class.*  
*Import `MatTableModule`.*

## Acceptance Criteria

- [ ] Role filter chips → `mat-chip-listbox` with `mat-chip-option` (or `tar-chip-set` if it supports toggle mode)
- [ ] Page-size select → `tar-select`
- [ ] Raw `<table>` → `mat-table` with named column definitions
- [ ] Row click (`selectUser`) preserved on `mat-row`
- [ ] `data-testid="user-row-{email}"` preserved via `[attr.data-testid]` on `mat-row`
- [ ] Role badge `<span class="user-list__role">` inside role column — keep as-is or use `mat-chip`
- [ ] Existing compliant elements (`tar-button`, `tar-search-field`, `tar-empty-state`) untouched

## Notes

- `mat-table` requires `MatTableModule` and `MatChipsModule` imports.
- Consider whether `tar-pagination` component should replace the page-size select + total count footer entirely.
- The `<span class="user-list__role">` role badge could become a `mat-chip` for better Material consistency — optional enhancement.
