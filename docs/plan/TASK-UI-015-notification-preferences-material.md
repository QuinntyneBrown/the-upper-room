# TASK-UI-015 — Migrate `tar-notification-preferences.html` (domain) to Angular Material / Component Library

**Status:** Complete  
**Priority:** P3  
**Effort:** Medium (1–2 days)  
**File:** `frontend/projects/domain/src/lib/notifications/notification-preferences/tar-notification-preferences.html`

---

## Problem

`tar-notification-preferences.html` uses raw buttons, a raw HTML table, and raw checkbox inputs — none of which use Angular Material or `components` library wrappers. This is a domain library component used on the settings/notifications page.

## Non-Compliant Elements Found

### Push Enable/Disable Buttons
```html
<!-- Current -->
<button type="button" class="btn-outlined" (click)="enablePush()">Enable push notifications</button>
<button type="button" class="btn-outlined" (click)="disablePush()">Disable push notifications</button>

<!-- Required -->
<tar-button variant="outlined" testId="push-enable-button" (clicked)="enablePush()">Enable push notifications</tar-button>
<tar-button variant="outlined" testId="push-disable-button" (clicked)="disablePush()">Disable push notifications</tar-button>
```

### Raw Table → `mat-table`
```html
<!-- Current -->
<table class="np__table">
  <thead>
    <tr><th>Notification</th><th>In-app</th><th>Email</th><th>Push</th><th></th></tr>
  </thead>
  <tbody>
    @for (pref of prefs(); track pref.code) {
      <tr [attr.data-testid]="'pref-row-' + pref.code">
        <td class="np__code">{{ pref.code }}</td>
        <td><input type="checkbox" [checked]="pref.inApp" (change)="onToggle(pref.code, 'inApp')" /></td>
        <td><input type="checkbox" [checked]="pref.email" (change)="onToggle(pref.code, 'email')" /></td>
        <td><input type="checkbox" [checked]="pref.push" (change)="onToggle(pref.code, 'push')" /></td>
        <td>@if (savedCode() === pref.code) { <span class="np__saved">Saved</span> }</td>
      </tr>
    }
  </tbody>
</table>

<!-- Required: mat-table with mat-checkbox cells -->
<table mat-table [dataSource]="prefs()" class="np__table">
  <ng-container matColumnDef="notification">
    <th mat-header-cell *matHeaderCellDef>Notification</th>
    <td mat-cell *matCellDef="let pref" class="np__code">{{ pref.code }}</td>
  </ng-container>
  <ng-container matColumnDef="inApp">
    <th mat-header-cell *matHeaderCellDef>In-app</th>
    <td mat-cell *matCellDef="let pref">
      <tar-checkbox
        testId="pref-toggle-inApp"
        [checked]="pref.inApp"
        (checkedChange)="onToggle(pref.code, 'inApp')"
      />
    </td>
  </ng-container>
  <ng-container matColumnDef="email">
    <th mat-header-cell *matHeaderCellDef>Email</th>
    <td mat-cell *matCellDef="let pref">
      <tar-checkbox
        testId="pref-toggle-email"
        [checked]="pref.email"
        (checkedChange)="onToggle(pref.code, 'email')"
      />
    </td>
  </ng-container>
  <ng-container matColumnDef="push">
    <th mat-header-cell *matHeaderCellDef>Push</th>
    <td mat-cell *matCellDef="let pref">
      <tar-checkbox
        testId="pref-toggle-push"
        [checked]="pref.push"
        (checkedChange)="onToggle(pref.code, 'push')"
      />
    </td>
  </ng-container>
  <ng-container matColumnDef="saved">
    <th mat-header-cell *matHeaderCellDef></th>
    <td mat-cell *matCellDef="let pref">
      @if (savedCode() === pref.code) {
        <span data-testid="pref-saved" class="np__saved">Saved</span>
      }
    </td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;" [attr.data-testid]="'pref-row-' + row.code"></tr>
</table>
```
*Add `displayedColumns = ['notification', 'inApp', 'email', 'push', 'saved']` to component.*

## Acceptance Criteria

- [x] Enable/Disable push buttons → `tar-button variant="outlined"` with `testId`
- [x] Raw `<table>` → `mat-table` with 5 named column definitions
- [x] `<input type="checkbox">` in cells → `tar-checkbox` with `(checkedChange)` output
- [x] `data-testid="pref-row-{code}"` preserved on `mat-row`
- [x] `data-testid="pref-toggle-inApp/email/push"` preserved via `testId` on `tar-checkbox`
- [x] `data-testid="pref-saved"` preserved on saved indicator span
- [x] `MatTableModule` and `MatCheckboxModule` imported in the domain module
- [x] `onToggle()` still fires correctly on checkbox change

## Notes

- This is a **domain library** component — `MatTableModule` must be added to the domain library's imports, not just the app.
- `tar-checkbox` emits `(checkedChange)` with a boolean — wire this to `onToggle(pref.code, channel)` via a lambda: `(checkedChange)="onToggle(pref.code, 'inApp')"`.
- The `savedCode()` signal display in the last column is a visual-only indicator — no interaction needed.
