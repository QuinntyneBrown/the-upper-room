Every modal in The Upper Room opens through Angular Material's `MatDialog` (a CDK overlay), never a hand-rolled overlay or `window.confirm`. The overlay owns the backdrop, focus trap, Escape and focus restore; the dialog labels itself with its own heading. Each story here opens the real dialog on load over a page header; close it and use the page's button to open it again.

- **Confirmations** go through `ConfirmService.confirm(options)`, which opens `tar-confirm-dialog` (`panelClass: 'tar-confirm-dialog-panel'`, focus on Cancel) and resolves `true` or `false`. `ConfirmOptions` sets `title`, `body`, `severity` (`info` | `warning` | `danger`, which sets `data-severity` on the host and its container colour), `confirmLabel`, `cancelLabel` and `requireTypedConfirmation`.
- **Titles** ask a question that names the object ("Delete Ama Mensah?"); the body states the consequence and any reversible alternative; the confirm label repeats the verb.
- **Destructive** deletes use `danger`. Deletions that take shared work with them (boards, cities) add `requireTypedConfirmation`.
- **Form dialogs** for button-triggered edits are small components opened with `MatDialog.open()`: `mat-dialog-title`, library fields inside `mat-dialog-content`, and `tar-form-actions` (Cancel + primary) inside `mat-dialog-actions align="end"`. The primary stays disabled until the form is valid.

Stable hooks: `confirm-dialog`, `confirm-title`, `confirm-body`, `confirm-typed-input`, `confirm-cancel`, `confirm-button`.
