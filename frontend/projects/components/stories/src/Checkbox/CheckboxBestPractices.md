## Best practices

### Layout

- Stack checkboxes vertically, one per line, with the box on the leading edge.
- Indent child checkboxes under an indeterminate "select all" parent.

### Content

- Labels are statements that are true when checked: "Email me before events", not "Don't email me".
- Use a checkbox for choices that take effect on save; use `tar-toggle` for settings that apply immediately.

### Accessibility

- Projected text is the accessible name; set `ariaLabel` only for a checkbox with no visible label (for example a table row selector).
- The whole label is clickable — keep it short.
