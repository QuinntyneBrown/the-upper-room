## Best practices

### Layout

- One toolbar per shell, at the very top; screens add a `tar-page-header` below it rather than a second toolbar.
- Show the menu button only when the side navigation is collapsed (phone and tablet widths).
- Set `scrolled` once content has moved under the toolbar.

### Content

- `title` is the product name or current city — keep it short so actions fit on a phone.
- Limit actions to two or three global icons (search, notifications, account); screen-specific actions belong in the page header.

### Accessibility

- Every icon-only action needs an `ariaLabel` on its `tar-icon-button`.
- Keep `menuAriaLabel` describing the result ("Open navigation"), and update it if the button also closes the navigation.
