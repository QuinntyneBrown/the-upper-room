# TASK-UI-016 — Migrate `tar-notification-bell.html` (domain) to Angular Material / Component Library

**Status:** Accepted  
**Priority:** P3  
**Effort:** Small (< 1 day)  
**File:** `frontend/projects/domain/src/lib/notifications/notification-bell/tar-notification-bell.html`

---

## Problem

`tar-notification-bell.html` is a domain component used globally in the app shell. It uses raw buttons for the bell trigger, tab switching, notification rows, and footer actions. It also uses raw `<span class="material-symbols-outlined">` for icons instead of `<mat-icon>`.

## Non-Compliant Elements Found

### Bell Trigger Button
```html
<!-- Current -->
<button class="notification-bell__btn" aria-label="Notifications" (click)="toggleMenu()">
  <span class="material-symbols-outlined">notifications</span>
  @if (unreadCount() > 0) {
    <span class="notification-bell__badge">{{ badgeLabel() }}</span>
  }
</button>

<!-- Required -->
<tar-icon-button
  testId="notification-bell"
  icon="notifications"
  ariaLabel="Notifications"
  (clicked)="toggleMenu()"
/>
<!-- Note: the badge overlay needs special handling — see Notes -->
```

### Tab Buttons (Unread / All)
```html
<!-- Current -->
<button class="notification-bell__tab" [class.notification-bell__tab--active]="activeTab() === 'unread'" role="tab" (click)="setTab('unread')">Unread</button>
<button class="notification-bell__tab" [class.notification-bell__tab--active]="activeTab() === 'all'" role="tab" (click)="setTab('all')">All</button>

<!-- Required -->
<!-- Use tar-tabs component if it supports a compact/pill variant, or use mat-tab-group -->
<tar-tabs
  [tabs]="[{label:'Unread',value:'unread'},{label:'All',value:'all'}]"
  [activeTab]="activeTab()"
  (tabChange)="setTab($event)"
/>
```

### Notification Row Buttons
```html
<!-- Current -->
<button class="notification-bell__row" [class.notification-bell__row--unread]="!n.read" (click)="onRowClick(n)">
  <span class="material-symbols-outlined notification-bell__row-icon--{{ n.severity | lowercase }}">
    {{ n.severity === 'Warning' ? 'warning' : ... }}
  </span>
  <div class="notification-bell__row-content">...</div>
</button>

<!-- Required -->
<button mat-button class="notification-bell__row" [class.notification-bell__row--unread]="!n.read" (click)="onRowClick(n)">
  <mat-icon class="notification-bell__row-icon notification-bell__row-icon--{{ n.severity | lowercase }}">
    {{ n.severity === 'Warning' ? 'warning' : n.severity === 'Success' ? 'check_circle' : 'info' }}
  </mat-icon>
  <div class="notification-bell__row-content">...</div>
</button>
```
*Notification rows are list items with complex content — use `mat-button` attribute directly rather than `tar-button` to preserve custom inner layout.*

### Empty State Icon Span
```html
<!-- Current -->
<span class="material-symbols-outlined notification-bell__empty-icon">notifications_off</span>

<!-- Required -->
<mat-icon class="notification-bell__empty-icon">notifications_off</mat-icon>
```

### Mark All Read Button (footer)
```html
<!-- Current -->
<button class="notification-bell__footer-btn" (click)="markAllRead()">Mark all as read</button>

<!-- Required -->
<tar-button variant="text" testId="notification-mark-all-read" (clicked)="markAllRead()">
  Mark all as read
</tar-button>
```

## Acceptance Criteria

- [ ] Bell trigger button → `tar-icon-button icon="notifications"` (badge handled separately — see Notes)
- [ ] Unread/All tab buttons → `tar-tabs` or `mat-tab-group`
- [ ] Notification row buttons → `mat-button` with `<mat-icon>` replacing `<span class="material-symbols-outlined">`
- [ ] Empty state icon span → `<mat-icon>`
- [ ] Mark all read button → `tar-button variant="text"`
- [ ] `data-testid` attributes preserved for all interactive elements
- [ ] `toggleMenu()`, `setTab()`, `onRowClick()`, `markAllRead()` still function
- [ ] Badge count still displays (see Notes)

## Notes

- The notification badge count (`notification-bell__badge`) is an overlay on top of the bell icon — `tar-icon-button` may not support an overlay badge slot. Options:
  1. Keep the bell as a custom button with `mat-icon-button` attribute and manually overlay the badge using `MatBadgeModule` (`[matBadge]="unreadCount()" [matBadgeHidden]="unreadCount() === 0"`).
  2. Wrap `tar-icon-button` in a `<div>` with a positioned badge span (keep existing approach).
  - **Recommended:** Use `mat-icon-button` with `matBadge` directive for the bell, which is the canonical Angular Material pattern.
- The notification rows are interactive list items with complex inner content — using raw `mat-button` attribute gives Material ripple behaviour while keeping layout flexibility.
- `tar-tabs` compact/pill variant may not match the visual style of the notification panel tabs — evaluate before committing; a custom `mat-tab-group` with `mat-tab-nav-bar` may be more appropriate.
