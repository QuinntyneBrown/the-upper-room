---
id: TASK-0074
title: Partner ↔ Contact link with role on link
status: Done
phase: P
depends_on: [TASK-0072, TASK-0065]
traces_to: [L2-036]
estimated_context: small
---

# TASK-0074: Partner contacts tab

## Goal
On the partner detail Contacts tab, list linked contacts in a table; "Link contact" opens a search dialog to assign a role (e.g., "Primary Contact"); unlink removes only the link.

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/partners/partner-contact-link.spec.ts`

**Page Object:** `components/LinkContactDialog.ts`, `components/PartnerContactsTab.ts`.

**Scenarios:**
1. Link a contact with role "Primary Contact" → row appears in table; click navigates to contact detail.
2. Unlink → confirmation; snackbar "Contact unlinked from {partner}" with Undo; contact entity remains.
3. Linking the same contact twice → 409 with friendly message.

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
