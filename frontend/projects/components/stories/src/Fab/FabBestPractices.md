## Best practices

### Layout

- At most one FAB per screen, for the main create action ("New idea", "New event").
- Use the extended form on wide layouts where there is room for the label; the icon-only form on phones.

### Content

- The glyph is almost always `add`; the label is a verb and the thing being created.

### Accessibility

- `ariaLabel` is required and, on the extended form, replaces the visible text as the accessible name — keep them identical.
- Make sure a positioned FAB never covers the last row of a list; leave bottom padding.
