## Best practices

### Layout

- Place it at the top of the list it filters, above any filter chips.
- Give it the full width of the list column; it stretches to its container.

### Content

- Say what is searched in the placeholder: "Search contacts by name or email".
- Filter as the user types; debounce server calls in the page, not the component.

### Accessibility

- With no visible `label`, make sure the placeholder (or `ariaLabel`) names what is searched — it becomes the accessible name.
- Keep the clear button: it is the keyboard user's quickest way to reset the list.
