# TASK-UI-003 — Migrate `contact-detail.html` to Angular Material / Component Library

**Status:** Accepted  
**Priority:** P3  
**Effort:** Small (< 1 day)  
**File:** `frontend/projects/the-upper-room/src/app/contacts/contact-detail/contact-detail.html`

---

## Problem

`contact-detail.html` is largely read-only and already uses several `tar-*` domain components (`tar-avatar`, `tar-share-button`, `tar-notes`, `tar-tag-selector`). However, the action buttons and the tab navigation bar still use raw HTML.

## Non-Compliant Elements Found

### Action Buttons (header)
```html
<!-- Current -->
<a class="btn-outlined" [href]="'/contacts/' + c.id + '/edit'">Edit</a>
<button class="btn-outlined" (click)="archive()">Archive</button>
<button class="btn-outlined" (click)="archive()">Restore</button>
<button class="btn-danger" (click)="deleteContact()">Delete</button>

<!-- Required -->
<tar-button variant="outlined" routerLink="/contacts/{{ c.id }}/edit">Edit</tar-button>
<tar-button variant="outlined" (clicked)="archive()">Archive</tar-button>
<tar-button variant="outlined" (clicked)="archive()">Restore</tar-button>
<tar-button variant="filled" color="warn" (clicked)="deleteContact()">Delete</tar-button>
```

### Tab Navigation
```html
<!-- Current -->
<nav class="tab-bar">
  <button class="tab" [class.tab--active]="activeTab() === 'overview'" (click)="activeTab.set('overview')">Overview</button>
  <button class="tab" [class.tab--active]="activeTab() === 'notes'" (click)="activeTab.set('notes')">Notes</button>
  <button class="tab" [class.tab--active]="activeTab() === 'activity'" (click)="activeTab.set('activity')">Activity</button>
</nav>

<!-- Required -->
<tar-tabs
  [tabs]="[{label:'Overview',value:'overview'},{label:'Notes',value:'notes'},{label:'Activity',value:'activity'}]"
  [activeTab]="activeTab()"
  (tabChange)="activeTab.set($event)"
/>
```

*Check `tar-tabs` component API (`frontend/projects/components/src/lib/tabs/tabs.html`) for exact input/output names before implementing.*

## Acceptance Criteria

- [ ] `<a class="btn-outlined">` Edit link → `tar-button variant="outlined"` with `routerLink`
- [ ] Archive/Restore buttons → `tar-button variant="outlined"`
- [ ] Delete button → `tar-button` with destructive styling (check `tar-button` color/variant support)
- [ ] Tab bar (`<nav class="tab-bar">`) → `tar-tabs` component
- [ ] Active tab state correctly passed and updated via `tar-tabs` outputs
- [ ] Tab panel content (overview, notes, activity) renders correctly after switching

## Notes

- The `<a>` tag used as a button should become a `tar-button` with `routerLink` directive — not an `href`. Confirm `tar-button` supports `routerLink`.
- If `tar-tabs` doesn't support the signal-based `activeTab()` pattern directly, wire via an intermediate handler.
- The "Delete" action is destructive — confirm the appropriate `tar-button` variant/color for danger actions.
