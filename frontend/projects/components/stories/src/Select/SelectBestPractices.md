## Best practices

### Layout

- Use for 4–15 options; fewer fits a `tar-radio-group`, more needs search.
- In filter bars, use a `placeholder` such as "All actions" instead of a label.

### Content

- Order options meaningfully (alphabetically for cities, by workflow for statuses).
- Disable an option rather than hiding it when the user should know it exists but can't pick it now.

### Accessibility

- Always give a `label` or an `ariaLabel`; the placeholder disappears once a value is chosen.
- The panel is keyboard navigable (arrow keys, type-ahead) — keep option labels distinct in their first letters where possible.
