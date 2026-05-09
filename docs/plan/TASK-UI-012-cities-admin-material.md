# TASK-UI-012 — Migrate `cities-admin.html` Table to `mat-table`

**Status:** Accepted  
**Priority:** P3  
**Effort:** Small (< 1 day)  
**File:** `frontend/projects/the-upper-room/src/app/cities/cities-admin/cities-admin.html`

---

## Problem

`cities-admin.html` is largely compliant — the header uses `tar-button`, the create form uses `tar-text-field` and `tar-form-actions`. The only remaining non-compliant element is the cities data table which uses a raw `<table>`.

## Non-Compliant Element

### Raw Table → `mat-table`
```html
<!-- Current -->
<table class="cities-admin__table">
  <thead>
    <tr><th>Name</th><th>Slug</th><th>Country</th><th>Status</th><th></th></tr>
  </thead>
  <tbody>
    @for (c of cities(); track c.id) {
      <tr [attr.data-testid]="'city-row-' + c.slug">
        <td>{{ c.name }}</td>
        <td>{{ c.slug }}</td>
        <td>{{ c.country }}</td>
        <td>{{ c.archived ? 'Archived' : 'Active' }}</td>
        <td>
          @if (!c.archived) {
            <tar-button [testId]="'city-archive-' + c.slug" variant="outlined" (clicked)="onArchive(c)">Archive</tar-button>
          }
        </td>
      </tr>
    }
  </tbody>
</table>

<!-- Required: mat-table -->
<table mat-table [dataSource]="cities()" class="cities-admin__table">
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef>Name</th>
    <td mat-cell *matCellDef="let c">{{ c.name }}</td>
  </ng-container>
  <ng-container matColumnDef="slug">
    <th mat-header-cell *matHeaderCellDef>Slug</th>
    <td mat-cell *matCellDef="let c">{{ c.slug }}</td>
  </ng-container>
  <ng-container matColumnDef="country">
    <th mat-header-cell *matHeaderCellDef>Country</th>
    <td mat-cell *matCellDef="let c">{{ c.country }}</td>
  </ng-container>
  <ng-container matColumnDef="status">
    <th mat-header-cell *matHeaderCellDef>Status</th>
    <td mat-cell *matCellDef="let c">{{ c.archived ? 'Archived' : 'Active' }}</td>
  </ng-container>
  <ng-container matColumnDef="actions">
    <th mat-header-cell *matHeaderCellDef></th>
    <td mat-cell *matCellDef="let c">
      @if (!c.archived) {
        <tar-button [testId]="'city-archive-' + c.slug" variant="outlined" (clicked)="onArchive(c)">Archive</tar-button>
      }
    </td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;" [attr.data-testid]="'city-row-' + row.slug"></tr>
</table>
```
*Add `displayedColumns = ['name', 'slug', 'country', 'status', 'actions']` to component class.*  
*Import `MatTableModule`.*

## Acceptance Criteria

- [ ] Raw `<table>` → `mat-table` with named `matColumnDef` blocks
- [ ] `data-testid="city-row-{slug}"` preserved on `mat-row`
- [ ] `tar-button` in actions column unchanged and functional
- [ ] `MatTableModule` imported in the component or its module
- [ ] Existing compliant header and create-form sections untouched

## Notes

- This is a low-risk, isolated change — the table is the only non-compliant element in the file.
- `mat-table` with `cities()` signal as the data source works directly; no `MatTableDataSource` wrapper needed for a simple static array.
