## Best practices

### Layout

- Render exactly one `tar-snackbar` in the app shell; pages call `SnackbarService.show()` and never render their own.
- Don't place other fixed UI in the bottom-left corner where the snackbar appears.

### Content

- One short sentence in plain language: "Partner archived", not "Operation completed successfully".
- At most one action, labelled with a verb: "Undo", "Reload", "View".
- Use `error` for failures the user must notice; it stays until dismissed.
- Don't use a snackbar for anything that needs a decision — use `ConfirmService`.

### Accessibility

- Errors are announced assertively (`role="alert"`), everything else politely (`role="status"`).
- Hover and keyboard focus pause auto-dismiss, so people have time to reach the action.
- Every snackbar has a labelled Dismiss button; don't hide it.
