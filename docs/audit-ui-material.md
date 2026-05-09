# UI Material Compliance Audit — The Upper Room

**Date:** 2026-05-09  
**Auditor:** Claude Code  
**Scope:** Angular frontend — all HTML templates in `the-upper-room` app, `components` library, and `domain` library

---

## Executive Summary

The audit examined **99 HTML template files** across three project layers. While the `components` library provides correct Angular Material wrappers (`tar-button`, `tar-text-field`, `tar-select`, `tar-checkbox`, `tar-textarea`, `tar-icon-button`), the majority of **application feature pages bypass these wrappers** and use raw HTML elements with custom CSS classes.

**Issues found by category:**

| Category | Files Affected | Instances |
|---|---|---|
| Raw `<button>` / `<a>` used as button | 12 | 40+ |
| Raw `<input>` without `mat-form-field` | 10 | 50+ |
| Raw `<textarea>` without `mat-form-field` | 6 | 8 |
| Raw `<select>` without `mat-select` | 7 | 10+ |
| Raw `<input type="checkbox">` without `mat-checkbox` | 4 | 8 |
| Raw `<table>` instead of `mat-table` | 4 | 4 |
| Raw `<span class="material-symbols-outlined">` instead of `mat-icon` | 5 | 10+ |
| Custom tab nav with raw `<button>` instead of `tar-tabs` | 3 | 3 |
| Inline custom dialogs instead of `tar-dialog` / `MatDialog` | 4 | 4 |

**Total tasks created:** 16 (see `docs/plan/`)

---

## Available Component Library Wrappers

These components in `frontend/projects/components/src/lib/` must be used instead of raw HTML elements:

| Component | Selector | Replaces |
|---|---|---|
| Button | `<tar-button variant="filled\|tonal\|outlined\|elevated\|text">` | `<button class="btn-*">` |
| Icon Button | `<tar-icon-button>` | `<button class="btn-icon\|icon-btn">` |
| Text Field | `<tar-text-field>` | `<input class="field__input">` in `mat-form-field` |
| Textarea | `<tar-textarea>` | `<textarea class="field__input">` in `mat-form-field` |
| Select | `<tar-select>` | `<select class="field__input\|config-select">` |
| Checkbox | `<tar-checkbox>` | `<input type="checkbox">` |
| Icon | `<mat-icon>` | `<span class="material-symbols-outlined">` |
| Tabs | `<tar-tabs>` | Custom `<nav>` + `<button>` tab bars |
| Dialog | `<tar-dialog>` / `MatDialog` | Inline `<div class="dialog-overlay">` patterns |

---

## Findings by File

### App — `the-upper-room`

#### `contact-create.html`
- **Buttons:** `<button class="btn-outlined">` (Cancel), `<button class="btn-filled">` (Save), `<button class="btn-icon">` (remove phone), `<button class="btn-add">` (add phone/email/address) — 5 instances  
- **Inputs:** `<input class="field__input">` for firstName, lastName, pronouns, title, org, displayName, phone value/label, email value/label, address fields — 12+ instances  
- **Checkboxes:** `<input type="checkbox">` for phone primary, email primary — 2 instances  
- **Task:** [TASK-UI-001](plan/TASK-UI-001-contact-create-material.md)

#### `contact-edit.html`
- **Buttons:** `<button class="btn-outlined">` (Cancel), `<button class="btn-filled">` (Save), `<button class="banner-btn">` (Reload) — 3 instances  
- **Inputs:** `<input class="field__input">` for firstName, lastName, pronouns, title, org, displayName — 6 instances  
- **Task:** [TASK-UI-002](plan/TASK-UI-002-contact-edit-material.md)

#### `contact-detail.html`
- **Buttons (raw):** `<button class="btn-outlined">` (Edit anchor as button), `<button class="btn-outlined">` (Archive/Restore), `<button class="btn-danger">` (Delete) — 3 instances  
- **Anchor-as-button:** `<a class="btn-outlined">` (Edit link styled as button) — 1 instance  
- **Tab nav:** `<nav class="tab-bar">` with `<button class="tab">` for Overview / Notes / Activity — should use `tar-tabs`  
- **Task:** [TASK-UI-003](plan/TASK-UI-003-contact-detail-material.md)

#### `partner-create.html`
- **Buttons:** `<button class="btn-outlined">` (Cancel), `<button class="btn-filled">` (Save) — 2 instances  
- **Inputs:** `<input class="field__input">` for name, website — 2 instances  
- **Icon span:** `<span class="material-symbols-outlined">open_in_new</span>` — 1 instance  
- **Task:** [TASK-UI-004](plan/TASK-UI-004-partner-create-material.md)

#### `partner-edit.html`
- **Buttons:** `<button class="btn-outlined">` (Cancel), `<button class="btn-filled">` (Save), `<button class="btn-icon">` (remove social link), `<button class="btn-outlined btn-sm">` (Add link) — 4 instances  
- **Inputs:** `<input class="field__input">` for name, website, social URL, social label — 4+ instances  
- **Selects:** `<select class="field__select">` for social platform — per-row instances  
- **Icon span:** `<span class="material-symbols-outlined">open_in_new</span>`, `<span class="material-symbols-outlined">close</span>` — 2 instances  
- **Task:** [TASK-UI-005](plan/TASK-UI-005-partner-edit-material.md)

#### `partner-detail.html`
- **Buttons:** `<button class="btn-outlined">` (Archive/Restore), `<button class="btn-danger">` (Delete), inline dialog buttons — 5+ instances  
- **Anchor-as-button:** `<a class="btn-outlined">` (Edit)  
- **Icon span:** `<span class="material-symbols-outlined">open_in_new</span>`  
- **Tab nav:** `<nav class="partner-tabs">` with `<button class="partner-tabs__tab">` — 3 tabs  
- **Inline dialog:** `<div class="dialog-backdrop">` delete-confirm dialog with raw `<input>` and raw `<button>` — should use `tar-dialog` / `MatDialog`  
- **Task:** [TASK-UI-006](plan/TASK-UI-006-partner-detail-material.md)

#### `audit-log.html`
- **Inputs:** `<input class="audit-log__filter-input">` for actor, entity-type filters — 2 instances  
- **Select:** `<select class="audit-log__filter-select">` for action filter — 1 instance  
- **Buttons:** `<button class="btn-primary">` (Apply), `<button class="btn-secondary">` (Previous/Next) — 3 instances  
- **Table:** Raw `<table>` / `<thead>` / `<tbody>` for audit entries — should use `mat-table`  
- **Task:** [TASK-UI-007](plan/TASK-UI-007-audit-log-material.md)

#### `create-board-wizard.html`
- **Inputs:** `<input class="wizard__input">` for board name — 1 instance  
- **Textarea:** `<textarea class="wizard__input">` for description — 1 instance  
- **Checkbox:** `<input type="checkbox">` for default columns — 1 instance  
- **Buttons:** `<button class="btn-text">` (Cancel), `<button class="btn-filled">` (Create) — 2 instances  
- **Dialog shell:** Custom `<div class="wizard-overlay">` instead of `tar-dialog`  
- **Task:** [TASK-UI-008](plan/TASK-UI-008-create-board-wizard-material.md)

#### `board-configure.html`
- **Selects:** `<select class="config-select">` (swimlane group by), `<select class="dialog__input">` (move-cards target) — 2 instances  
- **Buttons:** `<button class="btn-text">` (Delete column), `<button class="btn-text">` (Cancel move), `<button class="btn-filled">` (Confirm move) — 3 instances  
- **Inline dialog:** `<div class="dialog-overlay">` move-cards dialog — should use `tar-dialog`  
- **Task:** [TASK-UI-009](plan/TASK-UI-009-board-configure-material.md)

#### `card-detail-dialog.html`
- **Inputs:** `<input class="dialog__title">` (title), `<input class="dialog__input">` (schema fields) — 2+ instances  
- **Textarea:** `<textarea class="dialog__input">` (comment input) — 1 instance  
- **Buttons:** `<button class="btn-text">` (Archive), `<button class="btn-text btn-text--danger">` (Delete), `<button class="btn-icon">` (Close), `<button class="btn-filled">` (Add comment) — 4 instances  
- **Dialog shell:** Custom `<div class="dialog-overlay">` — should use `tar-dialog` / `MatDialog`  
- **Task:** [TASK-UI-010](plan/TASK-UI-010-card-detail-dialog-material.md)

#### `user-list.html`
- **Select:** `<select class="user-list__paginator-select">` for page size — 1 instance  
- **Filter chips:** `<button class="user-list__chip">` for role filter pills — multiple instances (should use `mat-chip-listbox` or `tar-chip-set`)  
- **Table:** Raw `<table>` / `<thead>` / `<tbody>` for user rows — should use `mat-table`  
- **Task:** [TASK-UI-011](plan/TASK-UI-011-user-list-material.md)

#### `cities-admin.html`
- **Table:** Raw `<table>` / `<thead>` / `<tbody>` for city rows — should use `mat-table`  
- *(Form controls and buttons already use `tar-text-field`, `tar-button`, `tar-form-actions` — compliant)*  
- **Task:** [TASK-UI-012](plan/TASK-UI-012-cities-admin-material.md)

---

### Domain Library — `projects/domain`

#### `invite-user-dialog.html`
- **Buttons:** `<button class="btn btn--ghost">` (Cancel), `<button class="btn">` (Send invitation) — 2 instances  
- **Inputs:** `<input class="field__input">` for email, firstName, lastName, city — 4 instances  
- **Select:** `<select class="field__input">` for role — 1 instance  
- **Textarea:** `<textarea class="field__input">` for personal message — 1 instance  
- **Dialog shell:** Custom backdrop + form pattern — should use `tar-dialog`  
- **Task:** [TASK-UI-013](plan/TASK-UI-013-invite-user-dialog-material.md)

#### `user-detail-drawer.html`
- **Buttons:** `<button class="icon-btn">` (Close), `<button class="btn btn--ghost">` (Reset password, Disable), `<button class="btn btn--danger">` (Delete) — 4 instances  
- **Select:** `<select>` for role assignment — 1 instance  
- **Task:** [TASK-UI-014](plan/TASK-UI-014-user-detail-drawer-material.md)

#### `tar-notification-preferences.html`
- **Buttons:** `<button class="btn-outlined">` (Enable/Disable push) — 2 instances  
- **Table:** Raw `<table>` for notification preference rows — should use `mat-table`  
- **Checkboxes:** `<input type="checkbox">` for inApp / email / push per preference — 3 per row  
- **Task:** [TASK-UI-015](plan/TASK-UI-015-notification-preferences-material.md)

#### `tar-notification-bell.html`
- **Buttons:** `<button class="notification-bell__btn">` (bell trigger), `<button class="notification-bell__tab">` (Unread/All tabs), `<button class="notification-bell__row">` (notification items), `<button class="notification-bell__footer-btn">` (Mark all read) — 5+ instances  
- **Icon spans:** `<span class="material-symbols-outlined">` for bell icon, empty state icon, severity icons — 3+ instances  
- **Task:** [TASK-UI-016](plan/TASK-UI-016-notification-bell-material.md)

---

## Compliant Files (No Action Required)

The following app files are already using `tar-*` components and Angular Material correctly:

- `cities-admin.html` — form section uses `tar-text-field`, `tar-button`, `tar-form-actions` *(table still needs fixing — TASK-UI-012)*
- `user-list.html` — uses `tar-button`, `tar-search-field`, `tar-empty-state`, domain components *(table and chips still need fixing — TASK-UI-011)*
- `contact-detail.html` — uses `tar-avatar`, `tar-share-button`, `tar-notes`, `tar-tag-selector` *(buttons and tabs still need fixing — TASK-UI-003)*
- All `auth/*` pages — use `tar-text-field`, `tar-button`, `tar-password-field` correctly
- `settings/appearance.html` — uses Material form controls
- `tags/tag-list.html` — uses `tar-button`, `tar-chip-set`

---

## Priority Matrix

| Priority | Task | Effort | Impact |
|---|---|---|---|
| P1 | TASK-UI-001 — contact-create | M | High (core feature, many inputs) |
| P1 | TASK-UI-002 — contact-edit | M | High (mirrors contact-create) |
| P1 | TASK-UI-013 — invite-user-dialog | S | High (domain component used globally) |
| P1 | TASK-UI-014 — user-detail-drawer | S | High (domain component used globally) |
| P2 | TASK-UI-004 — partner-create | S | Medium |
| P2 | TASK-UI-005 — partner-edit | M | Medium |
| P2 | TASK-UI-006 — partner-detail | M | Medium (inline dialog + tab nav) |
| P2 | TASK-UI-007 — audit-log | S | Medium (table + filters) |
| P2 | TASK-UI-008 — create-board-wizard | S | Medium |
| P2 | TASK-UI-009 — board-configure | S | Medium |
| P2 | TASK-UI-010 — card-detail-dialog | M | Medium |
| P2 | TASK-UI-011 — user-list | S | Medium (table + chips) |
| P3 | TASK-UI-003 — contact-detail | S | Low (mostly read-only, small changes) |
| P3 | TASK-UI-012 — cities-admin | S | Low (only table remaining) |
| P3 | TASK-UI-015 — notification-preferences | M | Low (domain, but has table) |
| P3 | TASK-UI-016 — notification-bell | S | Low (domain, visual/icon fixes) |

*S = Small (< 1 day), M = Medium (1–2 days)*
