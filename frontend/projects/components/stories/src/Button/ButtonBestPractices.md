## Best practices

### Layout

- One `filled` button per view for the primary action; use `tonal`, `outlined` or `text` for everything else.
- In dialogs and form footers the primary action sits on the right — use `tar-form-actions` rather than laying buttons out by hand.
- `fullWidth` is for narrow containers such as the sign-in card and phone layouts.

### Content

- Sentence case, usually a verb: "Save contact", "New board", "Archive partner".
- Confirm destructive actions with `ConfirmService` before running them.
- Set `loading` while the request is in flight; it disables the button so the action can't be submitted twice.

### Accessibility

- Buttons that submit a form need `type="submit"`; everything else stays `type="button"`.
- An icon-only action is a `tar-icon-button` with an `ariaLabel`, not a `tar-button` with an icon and no text.
