## Best practices

### Layout

- Use tooltips on icon-only controls in toolbars, list rows and Kanban cards.
- Prefer `below` or `above`; use `before`/`after` only where vertical space is tight.

### Content

- A few words that name the action: "Archive partner", "Show on map".
- Never put essential information or interactive content in a tooltip — it isn't reachable on touch devices.
- Don't repeat a visible text label in a tooltip.

### Accessibility

- A tooltip supplements an accessible name; it doesn't replace one — `tar-icon-button` still needs `ariaLabel`.
- Put the directive on a focusable element so keyboard users can reveal it.
