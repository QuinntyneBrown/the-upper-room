# Dialog Audit & MatDialog Refactor Plan

## 1. What `confirm.service.ts` does

`frontend/projects/components/src/lib/confirm-dialog/confirm.service.ts` is a **custom imperative-confirm bridge** that the app uses in lieu of `MatDialog`. Mechanics:

- `ConfirmService` (root-provided) holds a single `signal<ConfirmRequest | null>` named `current`.
- `confirm(options)` returns a `Promise<boolean>`. It stores `{ ...options, resolve }` in `current` so a single, globally-mounted `<tar-confirm-dialog />` (declared in `app.html`) reads the signal and renders itself.
- The dialog component (`tar-confirm-dialog.ts`) reads `svc.current()`, manages focus trap / Escape key, and calls `svc.resolve(true|false)` on confirm/cancel — which clears `current` and resolves the awaiting promise.
- It also leaks an escape hatch onto `window.__openConfirmDialog` for non-Angular callers.

Net effect: it emulates `MatDialog.open(...).afterClosed()` without using `@angular/material/dialog`. There is **only one confirm dialog instance at a time** (single signal slot — no stacking, no overlay, no CDK portals).

## 2. Is the app using the traditional `MatDialog` service?

**No.** Zero matches for `MatDialog`, `dialog.open(`, `MatDialogRef`, `MAT_DIALOG_DATA`, `@angular/material/dialog`, or `@angular/cdk/dialog` exist anywhere under `frontend/projects` (excluding e2e specs, which only assert DOM behavior).

Instead, three home-grown patterns coexist:

| Pattern | Primitive | How it opens |
| --- | --- | --- |
| **A. `ConfirmService` + global `<tar-confirm-dialog>`** | `components/src/lib/confirm-dialog/*` | `await confirmer.confirm({...})` (imperative) |
| **B. `<tar-dialog>` shell rendered conditionally** | `components/src/lib/dialog/dialog.ts` | `[open]="signal()"` driven by host component |
| **C. Hand-rolled `<div class="*-backdrop">` markup** | bespoke per feature | `@if (showFooDialog())` driven by host signal |

All three are functional but diverge in keyboard/focus handling, scrim behavior, ARIA, animation, and z-index management — exactly what `MatDialog` standardizes.

## 3. Inventory of every dialog in the app

### Pattern A — Imperative via `ConfirmService.confirm()`

| # | Caller | File | Purpose |
| --- | --- | --- | --- |
| A1 | `UserList.onDisable` | `the-upper-room/src/app/users/user-list/user-list.ts:137` | Confirm "Disable user" |
| A2 | `CardDetailDialog.onDelete` | `the-upper-room/src/app/kanban/card-detail-dialog/card-detail-dialog.ts:95` | Delete card with typed confirmation |
| A3 | `PartnerDetail.openDeleteDialog` (delete) | `the-upper-room/src/app/partners/partner-detail/partner-detail.ts:81` | Delete partner (typed) |
| A4 | `PartnerDetail.openDeleteDialog` (archive-instead) | `the-upper-room/src/app/partners/partner-detail/partner-detail.ts:100` | "Cannot delete → archive instead" |
| A5 | `PartnerContactsTab.unlinkContact` | `the-upper-room/src/app/partners/partner-contacts-tab/partner-contacts-tab.ts:57` | Unlink contact confirm |

Shared infra: `components/src/lib/confirm-dialog/confirm.service.ts`, `tar-confirm-dialog.ts/.html/.scss`, mounted once in `the-upper-room/src/app/app.html:3`.

### Pattern B — `<tar-dialog>` shell rendered inline

| # | Component | File(s) | Purpose |
| --- | --- | --- | --- |
| B1 | `InactivityDialog` | `domain/src/lib/auth/inactivity-dialog/inactivity-dialog.{ts,html}` | Idle warning (mounted globally in `app.html:4`) |
| B2 | `InviteUserDialog` | `domain/src/lib/users/invite-user-dialog/invite-user-dialog.{ts,html}` | Invite user form, opened by `UserList` |
| B3 | `CardDetailDialog` | `the-upper-room/src/app/kanban/card-detail-dialog/card-detail-dialog.{ts,html}` | Kanban card detail editor, opened by `BoardView` |
| B4 | Move-cards-on-delete dialog | `the-upper-room/src/app/kanban/board-configure/board-configure.{ts,html}` (lines 42-62 of html) | Pick target column when deleting a non-empty column |
| B5 | `CreateBoardWizard` | `the-upper-room/src/app/kanban/create-board-wizard/create-board-wizard.{ts,html}` | New board form |

### Pattern C — Hand-rolled markup (no shared shell)

| # | Dialog | File | Notes |
| --- | --- | --- | --- |
| C1 | `event-cancel-dialog` | `the-upper-room/src/app/events/event-detail/event-detail.html:186-225` | Inline `event-dialog-backdrop` div, controlled by `showCancelDialog` signal |
| C2 | `event-attendees-dialog` | `the-upper-room/src/app/events/event-detail/event-detail.html:227-259` | Same pattern, `showAttendeesDialog` signal |
| C3 | `recurrence-edit-dialog` | `the-upper-room/src/app/events/event-form/event-form.html:1-13` | Recurring-event scope chooser |
| C4 | `LinkContactDialog` | `the-upper-room/src/app/partners/link-contact-dialog/link-contact-dialog.{ts,html}` | Bespoke `.dialog-backdrop`/`.dialog` markup, EventEmitter-based parent contract |
| C5 | Board move-sheet | `the-upper-room/src/app/kanban/board-view/board-view.html:156-175` | `role="dialog"` action sheet for moving cards between columns |
| C6 | Note-history dialog | `components/src/lib/notes/tar-notes.html:61-80` | In shared `tar-notes` library; bespoke `notes__dialog` markup |
| C7 | `GlobalSearch` overlay | `the-upper-room/src/app/search/global-search.{ts,html}` | Full-viewport search palette (`global-search-backdrop`) — opened via `app-shell` `searchOpen()` |
| C8 | `UserDetailDrawer` | `domain/src/lib/users/user-detail-drawer/user-detail-drawer.html` | `role="dialog"` side panel — drawer-style but classifies as a modal |

### Other custom shells worth noting

- `components/src/lib/dialog/dialog.ts` — generic `<tar-dialog>` shell (used by every Pattern B item).
- `components/src/lib/drawer/drawer.html` — `<tar-drawer>` shell with `role="dialog"`/`aria-modal="true"` when used as a modal drawer.

These two are the **shared primitives that should be deleted** once the migration is complete (or kept only for non-modal layout if a use case warrants it).

## 4. Refactor plan — migrate every instance to `MatDialog.open(FooDialog)`

> Goal: every modal opens via `inject(MatDialog).open(FooDialogComponent, { data, ... })`, and each `FooDialogComponent` consumes its inputs through `@Inject(MAT_DIALOG_DATA)` and closes via `MatDialogRef<FooDialogComponent>`. Outputs become resolved values from `dialogRef.close(value)`.

### Phase 0 — Foundations

- [ ] **T-0.1** Add `MatDialogModule` to the components/domain libs that need it; add the global `MatDialog` provider where missing (currently nothing imports it).
- [ ] **T-0.2** Decide on a project-standard config (default `width`, `panelClass: 'tar-dialog-panel'`, `autoFocus: 'first-tabbable'`, `restoreFocus: true`) and expose it as a `provideMatDialogDefaults()` helper or `MAT_DIALOG_DEFAULT_OPTIONS` provider in `app.config.ts`.
- [ ] **T-0.3** Port the existing `tar-dialog`/`tar-confirm-dialog` styling tokens (radii, paddings, severity colors) into a global `tar-dialog-panel` class so visual parity is preserved.
- [ ] **T-0.4** Remove `<tar-confirm-dialog />` and `<app-inactivity-dialog />` from `the-upper-room/src/app/app.html` only after their migrations land (Phase 1 / Phase 2).
- [ ] **T-0.5** Decide whether `<tar-dialog>` and the `confirm.service.ts` window escape hatch are kept as deprecated shims during migration or deleted up-front (recommended: delete in Phase 5 to keep diffs reviewable).

### Phase 1 — Replace `ConfirmService` with `MatDialog`-based confirm

- [ ] **T-1.1** Create a new `ConfirmDialogComponent` under `components/src/lib/confirm-dialog/` that takes `ConfirmOptions` via `MAT_DIALOG_DATA`, manages typed-confirmation via local signal, and resolves with `dialogRef.close(boolean)`.
- [ ] **T-1.2** Rewrite `ConfirmService.confirm()` to delegate: `return firstValueFrom(this.dialog.open(ConfirmDialogComponent, { data: options }).afterClosed()).then(v => v === true)`. Keep the existing call sites untouched in this step.
- [ ] **T-1.3** Delete the signal-based `current`/`resolve` machinery and the `window.__openConfirmDialog` global.
- [ ] **T-1.4** Delete the old `tar-confirm-dialog.ts/.html/.scss` and the `<tar-confirm-dialog />` mount in `app.html`.
- [ ] **T-1.5** Verify A1–A5 still work (e2e: `e2e/tests/foundation/confirm-dialog.spec.ts`, plus the per-feature specs that drive these confirms).

### Phase 2 — Migrate Pattern B (template-driven `<tar-dialog>`)

For each item, the pattern is identical: turn the host signal (`inviteOpen`, `selectedCard`, `deleteTarget`, `creatingBoard`, …) into an imperative `dialog.open(...)` call; receive results via `afterClosed()` instead of `@Output`.

- [ ] **T-2.1 (B2 InviteUser)** Convert `InviteUserDialog` to consume `MAT_DIALOG_DATA<{ emailError$ }>` (or to receive a callback for live email-error updates) and emit submit via `dialogRef.close(payload)`. Replace `inviteOpen` signal in `UserList` with `this.dialog.open(InviteUserDialog).afterClosed().subscribe(...)`. Keep the 409 email-error round-trip working — most ergonomic option is to keep the dialog open and `patchState({ emailError })` via a passed-in subject in `data`.
- [ ] **T-2.2 (B3 CardDetailDialog)** Convert to MatDialog. Inputs (`card`, `schema`) move to `MAT_DIALOG_DATA`. Outputs (`patched`, `archived`, `deleted`, `closed`) become a discriminated-union result on `dialogRef.close({ kind: 'patch'|'archive'|'delete'|'close', ... })` consumed by `BoardView`. `BoardView`'s `selectedCardId` signal stays only as the open-state guard.
- [ ] **T-2.3 (B4 Move-cards confirm)** Extract the inline `<tar-dialog>` block from `board-configure.html` into a `MoveCardsDialogComponent` (in the same folder). Replace `deleteTarget` / `moveCardsTo` signal-driven open logic with `this.dialog.open(MoveCardsDialogComponent, { data: { target, options } }).afterClosed()`.
- [ ] **T-2.4 (B5 CreateBoardWizard)** Convert to MatDialog. The component already has no inputs and emits `submitted` / `cancelled`; collapse both to a `dialogRef.close(form | null)` result. Update the parent (find `<app-create-board-wizard />` usage and replace with a `dialog.open(...)` call).
- [ ] **T-2.5 (B1 InactivityDialog)** Migrate carefully — this dialog is *triggered by service state*, not user action. Best approach: have `IdleService` itself open `MatDialog` when `state() === 'warning'` (effect inside the service or a small controller component) and dismiss it on `staySignedIn()`. Remove `<app-inactivity-dialog />` from `app.html`.

### Phase 3 — Migrate Pattern C (hand-rolled markup)

Each of these needs a real component carved out of the host template, then opened via `dialog.open`.

- [ ] **T-3.1 (C1 EventCancelDialog)** Extract markup from `event-detail.html:186-225` into `EventCancelDialogComponent`. Move `cancelMessage` signal into the dialog component. `EventDetail` opens it and calls `confirmCancel` only after `afterClosed()` resolves with the message.
- [ ] **T-3.2 (C2 EventAttendeesDialog)** Extract `event-detail.html:227-259` into `EventAttendeesDialogComponent`. Pass `attendees` via `MAT_DIALOG_DATA`.
- [ ] **T-3.3 (C3 RecurrenceEditDialog)** Extract `event-form.html:1-13` into `RecurrenceEditDialogComponent`. Result is the chosen scope (`'single'|'following'|'series'`), consumed by `EventForm` — drop `recurrenceEditScope` / `showRecurrenceDialog` signals.
- [ ] **T-3.4 (C4 LinkContactDialog)** Convert the standalone component to a MatDialog component. Move `partnerId` to `MAT_DIALOG_DATA`, `linked`/`cancelled` outputs collapse to `dialogRef.close(LinkedContact | null)`. Replace its `dialog-backdrop`/`dialog` markup with `<h2 mat-dialog-title>`/`<mat-dialog-content>`/`<mat-dialog-actions>`. Update `PartnerContactsTab` to call `this.dialog.open(LinkContactDialogComponent, { data: { partnerId } })` and drop the `showDialog` signal.
- [ ] **T-3.5 (C5 BoardMoveSheet)** Extract `board-view.html:156-175` into `BoardMoveSheetDialogComponent` (or keep as a `MatBottomSheet` if the action-sheet semantics matter — note the user asked specifically for `MatDialog`, so use that with a panel class for bottom-sheet styling). Result: chosen `BoardColumn`. Drop `moveSheetCard` signal in favor of `dialog.open(...)`.
- [ ] **T-3.6 (C6 NoteHistoryDialog)** This lives in the shared `components/notes` library. Carve out `NoteHistoryDialogComponent` and open it from `TarNotes` via `MatDialog`. Remove the `historyNote` signal-driven inline markup.
- [ ] **T-3.7 (C7 GlobalSearch)** Migrate the `app-global-search` component. The shell currently renders it inline based on `searchOpen()` in `app-shell.html:4-6`. Convert to `dialog.open(GlobalSearchComponent, { panelClass: 'tar-global-search-panel', position: { top: '64px' } })` triggered by the existing search hotkey/avatar action. Remove `searchOpen` signal and the inline render.
- [ ] **T-3.8 (C8 UserDetailDrawer)** Decide: keep as drawer (out of scope for "MatDialog") or migrate. If migrating, open via `dialog.open(UserDetailDrawerComponent, { panelClass: 'tar-drawer-panel', position: { right: '0' }, height: '100%' })` so it preserves the side-sheet feel. Drop the `selectedUser` signal in `UserList` in favor of `afterClosed()`.

### Phase 4 — Test-suite updates

- [ ] **T-4.1** Rebuild Playwright dialog selectors. Most e2e specs already query by `data-testid` (e.g. `confirm-dialog`, `link-contact-dialog`, `event-cancel-dialog`, `card-detail-dialog`, etc.). Ensure each MatDialog wrapper sets `panelClass` and that the dialog component itself preserves the `data-testid` on its root element so the e2e Page Objects in `e2e/components/*` keep working.
- [ ] **T-4.2** Update Page Objects under `e2e/components/`: `ConfirmDialog.ts`, `InviteUserDialog.ts`, `InactivityDialog.ts`, `LinkContactDialog.ts`, `CardDetailDialog.ts`, `GlobalSearchDialog.ts`, `NoteHistoryDialog.ts` for any selector drift introduced by the CDK overlay.
- [ ] **T-4.3** Re-run / adjust the existing material-targeted specs: `invite-user-dialog-material.spec.ts`, `board-configure-material.spec.ts`, `card-detail-dialog-material.spec.ts`, `inactivity-dialog-via-library.spec.ts` — these are the files that already encode the MatDialog endpoint and were presumably created in anticipation of this migration.
- [ ] **T-4.4** Run a full a11y pass (`hardening/a11y.spec.ts`) to confirm focus-trap / restore-focus parity now provided by CDK overlay.

### Phase 5 — Cleanup

- [ ] **T-5.1** Delete `components/src/lib/dialog/dialog.{ts,html,scss}` (`<tar-dialog>` shell). Drop its export from `components/src/public-api.ts`.
- [ ] **T-5.2** Delete the legacy `tar-confirm-dialog.{ts,html,scss}` if not already removed, and prune `confirm.service.ts` of any dead helpers.
- [ ] **T-5.3** Decide on `components/src/lib/drawer/drawer.{ts,html,scss}` — keep for non-modal navigation or remove if no longer used after T-3.8.
- [ ] **T-5.4** Search for and delete bespoke `*dialog-backdrop` / `*-dialog` SCSS rules orphaned in feature folders (`event-detail.scss`, `event-form.scss`, `link-contact-dialog.scss`, `board-view.scss`, `notes`, `global-search.scss`, etc.).
- [ ] **T-5.5** Remove the `__openConfirmDialog` window escape hatch and any test code depending on it.
- [ ] **T-5.6** Update `docs/idea.md` / user-guide if either references the old confirm pattern.

### Migration ordering recommendation

1. Phase 0 → Phase 1 first (the confirm-service migration is a self-contained vertical slice; it unblocks Pattern A everywhere).
2. Phase 2 next, in this order: T-2.4 (CreateBoardWizard, simplest) → T-2.3 → T-2.2 → T-2.1 → T-2.5 (Inactivity is touchiest because of service-driven state).
3. Phase 3 in any order; recommend starting with C3 (RecurrenceEditDialog, smallest) and ending with C7 (GlobalSearch, highest blast radius because of shell wiring).
4. Phase 4 alongside each migration (don't batch e2e fixes).
5. Phase 5 only after every preceding phase is green.

## 5. Notes / risks

- The current `<tar-dialog>` allows multiple dialogs to be stacked because each instance lives in the host template. `MatDialog` also supports stacking, but z-index and scrim-click behavior differ — verify any test that depends on backdrop-click semantics (currently `closeOnBackdrop` defaults to `true` for `<tar-dialog>` but `false` for `<tar-confirm-dialog>`; mirror this with `disableClose` in the MatDialog config).
- `ConfirmService.confirm` currently resolves `false` on Escape (see `tar-confirm-dialog.ts:54`). MatDialog defaults to `undefined` on Escape — explicitly map `result === true` in the new `ConfirmService.confirm` wrapper to preserve call-site contracts.
- `__openConfirmDialog` on `window` may be used by external scripts (analytics, tour libs). Grep external integrations before removal.
- `UserDetailDrawer` is morphologically a drawer (`<aside>`, side-anchored). If it stays a drawer, exclude it from this migration and document the carve-out rather than forcing it through `MatDialog`.
