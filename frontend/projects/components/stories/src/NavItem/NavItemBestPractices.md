## Best practices

### Layout

- Stack nav items in a `<tar-list [role]="null">` inside a `<nav>` landmark, in `tar-side-nav`'s `tar-side-nav-content` slot. Clearing the list role keeps links from being announced as a list with no list items.
- Keep top-level destinations to the app's main areas (Contacts, Partners, Ideas, Events, Locations, Boards); group anything else under a divider.

### Content

- Labels are one or two words, title case, naming the destination ("Contacts", "Boards").
- Give every item an icon so the list scans consistently.
- Use `badge` for a small count of things needing attention; pass `null` rather than `0` when there is nothing to show.

### Accessibility

- Exactly one item is `active` at a time. Because `active` is visual only, also set `aria-current="page"` semantics at the shell level if the page has no other cue to the current location.
- Use `routerLink` for navigation so the item is a real link (open in new tab, correct announcements); reserve the button form for actions.
