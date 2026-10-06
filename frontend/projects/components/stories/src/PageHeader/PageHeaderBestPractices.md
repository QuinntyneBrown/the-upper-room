## Best practices

### Layout

- One page header per screen, directly under the toolbar and above the page content.
- Put at most one filled `tar-button` in the actions slot; further actions are icon buttons or live in a menu.
- Set `scrolled` only once the content has scrolled under the header, so the shadow means something.

### Content

- `title` names the screen or the entity ("Contacts", "Grace Community Church").
- `eyebrow` gives context above the title — the city or entity type ("Toronto", "Partner").
- `subtitle` is one short line of supporting facts, not a paragraph.

### Accessibility

- The title is the page's only `<h1>`; don't add another heading level 1 in the content.
- Give `backLabel` a destination ("Back to partners") rather than the generic default.
- Icon-only actions in the slot must be `tar-icon-button`s with an `ariaLabel`.
