## Best practices

### Layout

- Centre a 40px spinner in the region that is loading; keep the region's size stable so content doesn't jump when it arrives.
- Inline, use a 20–24px spinner beside a short status line.
- Buttons have their own `loading` state — don't put a spinner inside a `tar-button`.

### Content

- Prefer `tar-skeleton` for lists and tables, where the shape of the content is known in advance.
- Use `determinate` only for real, measurable progress such as an upload.
- Show one spinner per region, not one per row.

### Accessibility

- Set `ariaLabel` to the task ("Loading partners"), not the default "Loading".
- Pair the spinner with visible text when the wait may be longer than a second or two.
