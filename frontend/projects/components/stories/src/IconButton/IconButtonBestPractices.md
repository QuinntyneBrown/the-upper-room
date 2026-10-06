## Best practices

### Layout

- Use for secondary row and toolbar actions (edit, archive, overflow menu); the primary action on a screen is a `tar-button` or `tar-fab`.
- Group related icon buttons together at the end of a row or card header.

### Content

- Pick glyphs with an established meaning (`edit`, `delete`, `more_vert`); anything ambiguous deserves a labelled `tar-button` instead.
- Destructive icon buttons still go through `ConfirmService`.

### Accessibility

- `ariaLabel` is the only accessible name — make it specific: "Archive Riverside Food Bank", not "Archive".
- Keep `type="button"` unless the button genuinely submits a form.
