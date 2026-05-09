---
id: TASK-0100
title: Idea data model + API + list with vote
status: Completed
phase: I
depends_on: [TASK-0033, TASK-0010]
traces_to: [L2-048, L2-049]
estimated_context: medium
---

# TASK-0100: Ideas list + voting

## Goal
Persist Idea + IdeaVote + IdeaPartner (link). Render `/ideas` responsive grid (XS 1, MD 2, LG 3) with vote toggle (heart icon, optimistic UI), filters (Status, Partner, Tag, "My ideas") and sort (Most votes, Newest, Updated).

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/ideas/idea-list-vote.spec.ts`

**Page Object:** `pages/IdeasListPage.ts`.

**Scenarios:**
1. Empty `/ideas` shows icon `lightbulb` empty state.
2. Click heart on idea → optimistic increment with `0.95→1.0` scale animation; persists.
3. Second click removes vote → snackbar "Vote removed" (info, 4s).
4. Filter "My ideas" returns only those proposed by the current user.
5. Sort "Most votes" orders by vote count desc.

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
