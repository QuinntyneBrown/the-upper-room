---
id: TASK-0101
title: Idea detail + Markdown editor
status: Completed
phase: I
depends_on: [TASK-0100]
traces_to: [L2-050, L2-051]
estimated_context: medium
---

# TASK-0101: Idea detail + editor

## Goal
`/ideas/:id` with hero (cover image full-width up to 360px), title, proposer + date, vote button, action buttons. Markdown editor with toolbar (bold, italic, link, list, heading, code, image upload), live preview tab, char count (max 10000), image uploads to `/api/v1/uploads` (5 MB max for ideas — 10 MB for boards).

## Acceptance Tests

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/ideas/idea-detail-editor.spec.ts`

**Page Objects:** `pages/IdeaDetailPage.ts`, `components/MarkdownEditor.ts`.

**Scenarios:**
1. Idea detail page renders sanitized HTML body with the cover image.
2. Editor: bold toolbar wraps selection in `**...**`; preview tab renders bolded.
3. Image upload of 11MB rejected with "Image is too large (max 10MB). Try a smaller image.".
4. Type past 10000 chars → input rejects further keys; counter turns error.

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
