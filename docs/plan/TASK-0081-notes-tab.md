---
id: TASK-0081
title: Notes tab component (composer + list)
status: Completed
phase: N
depends_on: [TASK-0080, TASK-0065]
traces_to: [L2-042]
estimated_context: medium
---

# TASK-0081: Notes tab

## Goal
Reusable `<tar-notes [subjectType] [subjectId]>` rendered on Contact, Partner, Idea, Event Notes tabs. Composer (multi-line, "Cmd+Enter to save"), newest-first list, edit/delete (author or admin), relative time with absolute fallback at >7 days.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/notes/notes-tab.spec.ts`

**Page Object:** `components/NotesTab.ts` (`composer()`, `submitButton()`, `note(index)`).

**Scenarios:**
1. On contact detail Notes tab, write "Hello world" and submit → note appears at the top with author + "just now".
2. Note shorter than 2 chars → helper "Notes must be at least 2 characters."; composer keeps focus.
3. Edit note → form replaces body; save updates the rendered HTML.
4. Author can delete own note; non-author Member cannot see Delete.
5. Note from 8 days ago shows absolute date "Mar 5, 2026".

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
