---
id: TASK-0125
title: RSVP + capacity + waitlist
status: Done
phase: E
depends_on: [TASK-0123]
traces_to: [L2-052, L2-055]
estimated_context: medium
---

# TASK-0125: RSVP

## Goal
Segmented "Yes / Maybe / No" RSVP. When `Yes` exceeds capacity, user enters Waitlist with snackbar "You're on the waitlist (#N)". Approval-required events show "Pending approval" until organizer confirms.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/events/rsvp.spec.ts`

**Scenarios:**
1. RSVP Yes on event with available capacity → status "Going" persisted.
2. RSVP Yes on full event (capacity 10, 10 yes) → snackbar "You're on the waitlist (#1)".
3. Approval-required event → after RSVP Yes, snackbar "RSVP submitted. The organizer will confirm shortly.".
4. Organizer can approve/deny pending RSVPs from a side panel.
5. When a confirmed Yes cancels, the next waitlisted user is auto-promoted.

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
