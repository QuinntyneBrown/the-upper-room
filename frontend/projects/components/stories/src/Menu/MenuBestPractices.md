## Best practices

### Layout

- Put the menu at the trailing end of the row, card or page header it acts on.
- Use `xPosition="before"` when the trigger sits at the right edge so the panel opens inward.
- Keep the panel short — around seven items; split longer lists into separate menus.

### Content

- Start each label with a verb: "Edit contact", "Duplicate", "Archive location".
- Put destructive items last, after a divider, and mark them `danger`.
- Confirm destructive items with `ConfirmService` before acting on `itemSelected`.

### Accessibility

- Give every trigger an `ariaLabel` that names its subject ("Board actions"), not the default "Open menu".
- `mat-menu` manages focus and arrow-key navigation — don't add your own key handling.
