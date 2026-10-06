## Best practices

### Layout

- Lay cards out in a responsive grid (`repeat(auto-fill, minmax(…))`) so they reflow from phone to desktop.
- Keep one appearance per collection — mixing `filled`, `outlined` and `raised` in one grid reads as a hierarchy that isn't there.
- Use `showActions` only when the card has its own actions; an empty actions row still takes space.

### Content

- `heading` is the entity name ("Grace Community Church"); `subheading` is the type and context ("Partner · Toronto").
- Keep the body short — a sentence or a couple of facts. The detail page holds the rest.
- Card actions are text or tonal buttons; the page's primary action stays outside the card.

### Accessibility

- Make the whole card `interactive` _or_ give it action buttons — not both, since nested buttons inside a `role="button"` are not reachable as separate controls.
- An interactive card responds to Enter; its `heading` becomes the accessible name, so always set one.
