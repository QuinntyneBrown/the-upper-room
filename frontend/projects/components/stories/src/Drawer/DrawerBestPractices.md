## Best practices

### Layout

- Use `position="end"` (the default) for details and filters; `start` is for navigation-like choices.
- Put the drawer's actions in the `tar-drawer-footer` slot, primary action last, so they stay visible while the body scrolls.
- Use a CDK Dialog instead when the task needs the user's full attention or creates/edits a record.

### Content

- `title` names the subject ("Hannah Lee", "Filter events").
- Keep the body to supporting detail or a short set of choices; link out to the full screen for anything longer.

### Accessibility

- Always set `ariaLabel`; the title is not wired up as the accessible name.
- The drawer does not trap or move focus. Move focus into it when it opens and back to the trigger when `closed` fires.
- Use `role="complementary"` for non-blocking panels so assistive technology doesn't treat the page as inert.
