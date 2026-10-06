## Best practices

### Layout

- Put it at the bottom of every editing form and dialog; don't lay out Save/Cancel by hand.
- `sticky` gives the footer a surface background and top border for forms that sit on scrolling content; check the pinning in the page, since the sticky element is inside the host.

### Content

- Name the save action after the result when it helps: "Save contact", "Create board".
- Drive `dirty` from the form so an unchanged form can't be saved, and `saving` from the request so it can't be submitted twice.

### Accessibility

- Keep `saveType="submit"` inside a `<form>` so Enter submits; use `button` when the component sits outside one.
- Disabled buttons aren't focusable — pair `disabled` with a visible reason (a field error) so the user knows why Save is unavailable.
