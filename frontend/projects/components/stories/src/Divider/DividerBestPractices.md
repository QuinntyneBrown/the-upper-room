## Best practices

### Layout

- Prefer spacing over dividers; reach for a divider only when whitespace alone doesn't separate the groups.
- A vertical divider needs a parent with a defined height or a stretching flex row, otherwise it collapses.
- Use `inset` inside lists so the rule lines up with the item text rather than the leading icon.

### Content

- Don't stack a divider directly against a card or toolbar edge — those surfaces already have their own boundary.
- Separate sections of a detail page (contact details, notes, history), not individual fields.

### Accessibility

- The divider is announced as a separator; don't use it purely for decoration inside running text.
- The `outline-variant` colour is decorative; never rely on a divider alone to convey grouping that matters — use headings too.
