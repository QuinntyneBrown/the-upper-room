## Best practices

### Layout

- Lists fill their container; constrain the width with the surrounding layout, not on the list itself.
- Use inset `tar-divider`s between items only when rows have multiple lines; single-line lists read fine without them.
- Until static rows get the Material list-item layout (see above), prefer `interactive` rows for lists users scan or pick from.
- Long lists belong on a full screen with paging or filtering, not inside a card.

### Content

- `title` is the entity name; `description` is one line of context (role and city, date and location).
- Use one icon per list type (`event`, `person`, `location_city`) rather than a different icon per row.
- Show an empty state (`tar-empty-state`) instead of an empty list.

### Accessibility

- Always give the list an `ariaLabel` that names what it contains ("Recent contacts").
- `active` is visual only. When a list acts as a selector, also reflect the selection in the page (heading, detail pane) so it is not conveyed by colour alone.
- An `interactive` item renders an `<a>` without an `href`, so it is not reachable by Tab; for keyboard-critical navigation use `tar-nav-item` with a `routerLink` instead.
