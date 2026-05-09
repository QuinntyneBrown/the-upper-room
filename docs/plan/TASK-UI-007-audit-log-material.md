# TASK-UI-007 — Migrate `audit-log.html` to Angular Material / Component Library

**Status:** Accepted  
**Priority:** P2  
**Effort:** Small (< 1 day)  
**File:** `frontend/projects/the-upper-room/src/app/admin/audit-log/audit-log.html`

---

## Problem

`audit-log.html` uses raw filter inputs, a raw select, raw buttons for pagination, and a raw HTML table — none of which use Angular Material or the `components` library wrappers.

## Non-Compliant Elements Found

### Filter Inputs (2 instances)
```html
<!-- Current -->
<input class="audit-log__filter-input" type="text" placeholder="Actor" [value]="filterActor()" ... />
<input class="audit-log__filter-input" type="text" placeholder="Entity type" [value]="filterEntityType()" ... />

<!-- Required -->
<tar-text-field
  testId="audit-filter-actor"
  placeholder="Actor"
  [value]="filterActor()"
  (valueChange)="filterActor.set($event)"
/>
<tar-text-field
  testId="audit-filter-entity-type"
  placeholder="Entity type"
  [value]="filterEntityType()"
  (valueChange)="filterEntityType.set($event)"
/>
```

### Filter Select (action)
```html
<!-- Current -->
<select class="audit-log__filter-select" [value]="filterAction()" (change)="filterAction.set($any($event.target).value)">
  @for (a of actions; track a) {
    <option [value]="a">{{ a || 'All actions' }}</option>
  }
</select>

<!-- Required -->
<tar-select
  testId="audit-filter-action"
  placeholder="All actions"
  [value]="filterAction()"
  [options]="actionOptions"
  (valueChange)="filterAction.set($event)"
/>
```
*Compute `actionOptions` in component: `actions.map(a => ({ label: a || 'All actions', value: a }))`*

### Apply Button
```html
<!-- Current -->
<button class="btn-primary" (click)="applyFilters()">Apply</button>

<!-- Required -->
<tar-button variant="filled" testId="audit-filter-apply" (clicked)="applyFilters()">Apply</tar-button>
```

### Pagination Buttons
```html
<!-- Current -->
<button class="btn-secondary" [disabled]="page() === 1" (click)="prevPage()">Previous</button>
<button class="btn-secondary" [disabled]="page() * pageSize >= total()" (click)="nextPage()">Next</button>

<!-- Required -->
<tar-button variant="outlined" testId="audit-page-prev" [disabled]="page() === 1" (clicked)="prevPage()">Previous</tar-button>
<tar-button variant="outlined" testId="audit-page-next" [disabled]="page() * pageSize >= total()" (clicked)="nextPage()">Next</tar-button>
```

### Raw Table → `mat-table`
```html
<!-- Current -->
<table class="audit-log__table">
  <thead><tr><th>Timestamp</th>...</tr></thead>
  <tbody>
    @for (entry of entries(); track entry.id) {
      <tr><td>{{ entry.timestamp | date:'short' }}</td>...</tr>
    }
  </tbody>
</table>

<!-- Required: mat-table with column definitions -->
<table mat-table [dataSource]="entries()" class="audit-log__table">
  <ng-container matColumnDef="timestamp">
    <th mat-header-cell *matHeaderCellDef>Timestamp</th>
    <td mat-cell *matCellDef="let entry">{{ entry.timestamp | date:'short' }}</td>
  </ng-container>
  <!-- ... repeat for actor, entityType, entityId, action -->
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;" data-testid="audit-log-row"></tr>
</table>
```
*Add `displayedColumns = ['timestamp', 'actor', 'entityType', 'entityId', 'action']` to the component class.*  
*Import `MatTableModule` in the component or its module.*

## Acceptance Criteria

- [ ] Actor and entity-type filter inputs → `tar-text-field`
- [ ] Action filter select → `tar-select` with computed `actionOptions`
- [ ] Apply button → `tar-button variant="filled"`
- [ ] Previous/Next pagination buttons → `tar-button variant="outlined"`
- [ ] Raw `<table>` → `mat-table` with `matColumnDef` definitions
- [ ] `data-testid="audit-log-table"` and `data-testid="audit-log-row"` preserved
- [ ] Empty-state paragraph (`audit-log-empty`) unchanged
- [ ] All existing filter and pagination logic preserved

## Notes

- `mat-table` requires `MatTableModule` imported in the component's imports array (standalone) or its NgModule.
- Consider using `tar-pagination` (if it exists in the components library) for Previous/Next instead of individual buttons — check `frontend/projects/components/src/lib/pagination/pagination.html`.
- The `tar-empty-state` component could replace the plain `<p>` empty message.
