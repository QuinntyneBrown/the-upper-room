---
id: TASK-0160
title: Audit trail persistence + admin log page
status: Completed
phase: Au
depends_on: [TASK-0033]
traces_to: [L2-098]
estimated_context: medium
---

# TASK-0160: Audit trail

## Goal
EF Core SaveChanges interceptor writes `AuditEntries` rows for every Create/Update/Delete on the entities listed in L2-098. Admin page `/admin/audit` lists entries with filters (Actor, Entity Type, Action, Date range) and paginates.

## Acceptance Tests

### Backend Integration
- `AuditInterceptorTests.cs` — Updating contact phone records `before/after` JSON diff.
- Login/logout/permission-denied recorded.

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/audit/audit-log.spec.ts`

**Page Object:** `pages/AuditLogPage.ts`.

**Scenarios:**
1. SystemAdmin can access `/admin/audit`; CityLead is forbidden.
2. Performing an action (delete contact) shows up at the top of the audit log within 5s.
3. Filter by Action=Delete returns only deletes.

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
