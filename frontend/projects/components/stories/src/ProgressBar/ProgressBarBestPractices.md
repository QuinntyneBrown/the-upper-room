## Best practices

### Layout

- Let the bar span the full width of the area it describes — a card, a dialog or the top of a list.
- Pin it to the top edge of the surface that is refreshing rather than floating it in the middle of content.
- For a whole list that has not loaded yet, prefer `tar-skeleton`; use the bar when content is already on screen.

### Content

- Use `determinate` only when you can report real progress (rows imported, events published); otherwise use `indeterminate`.
- Pair a determinate bar with text counts such as "128 / 320 contacts".
- Remove the bar as soon as the work finishes — don't leave a bar stuck at 100%.

### Accessibility

- Always set `ariaLabel` to what is loading ("Importing contacts"); the default "Loading" says nothing about the task.
- The bar is not announced as it moves; announce completion separately, e.g. with `SnackbarService`.
