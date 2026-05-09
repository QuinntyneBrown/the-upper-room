---
id: TASK-0120
title: Event data model + API + list page
status: Done
phase: E
depends_on: [TASK-0033, TASK-0070, TASK-0110]
traces_to: [L2-052, L2-053]
estimated_context: medium
---

# TASK-0120: Events list

## Goal
Persist Event with all L2-052 fields. Render `/events` with list/calendar toggle (default List on XS, Calendar on MD+). Cards show cover, status chip per L2-053, date+time (locale + TZ abbrev), location/virtual indicator, RSVP count + capacity. Filters: Status, Tag, Partner, Date range, "My events".

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/events/event-list.spec.ts`

**Page Object:** `pages/EventsListPage.ts`.

**Scenarios:**
1. Empty list shows event-icon empty state.
2. Cancelled event card has top error-container ribbon and strikethrough title.
3. Filter "Status=Scheduled" hides past/cancelled events.
4. Toggle to Calendar at MD+ swaps to month view (TASK-0121).

## UI Component Requirements (MANDATORY — Angular Material)

If this task introduces or modifies any user-facing UI element, **all UI components MUST use Angular Material primitives**. Raw HTML form controls and custom-styled overlays are forbidden.

- **Source of components:** import from the shared `'components'` library first (`TarButton`, `TarFab`, `TarIconButton`, `TarTextField`, `TarTextarea`, `TarSelect`, `TarList`, `TarCard`, `ConfirmService`, `SnackbarService`). Fall back to `@angular/material` modules directly (`MatDialog`, `MatFormField` + `matInput`, `MatSelect`, `MatButton`, `MatList`, `MatCard`, `MatChipGrid`, `MatDatepicker`, etc.).
- **Forbidden:** raw `<button>`, `<input>`, `<select>`, `<textarea>`, hand-rolled overlay/modal `<div>`s, custom CSS-styled form controls, ad-hoc dropdown menus.
- **Buttons:** `TarButton` / `TarFab` / `TarIconButton` or `mat-button` / `mat-icon-button` / `mat-fab` — never raw `<button>` styled with custom CSS.
- **Form fields:** `TarTextField` / `TarTextarea` / `TarSelect` or `mat-form-field` + `matInput` / `mat-select` — never raw `<input>` / `<select>` / `<textarea>`.
- **Dialogs & overlays:** `MatDialog` service with a dialog component — never hand-rolled overlay `<div>` with backdrop CSS.
- **Confirmations:** `ConfirmService` from `'components'` — never `window.confirm` or custom dialogs.
- **Snackbar/toasts:** `SnackbarService` from `'components'` — never custom toast components.
- **Lists:** `mat-list` / `TarList` — never `<ul>` styled as a list control.
- **Cards/surfaces:** `mat-card` / `TarCard` — never raw `<div>` with elevation CSS.
- **Chips/tags:** `mat-chip-grid` / `mat-chip-row` — never custom chip elements.

This requirement is **enforced at code review**. Any PR introducing raw HTML form controls, custom overlay divs, or `window.confirm` for this task will be rejected. If a needed primitive is missing from `'components'`, add it to that library rather than inlining a custom one.
