## Best practices

### Layout

- Give the side nav a parent with a definite height (the shell's full viewport) — it sizes itself to `height: 100%`.
- Use `mode="side"` with `opened` on desktop and `mode="over"` toggled from the toolbar's menu button on phones.
- Use `fixedInViewport` only when the drawer must stay put while the whole document scrolls.

### Content

- Fill the drawer with `tar-nav-item`s in a `<tar-list [role]="null">` inside a `<nav>` (the list supplies the Material list-item styles); keep it to the main areas of the app.
- Put the current city or account switcher at the top or bottom of the drawer, not between destinations.

### Accessibility

- Wrap the drawer content in `<nav aria-label="Main">` so it is exposed as a navigation landmark.
- In `over` mode always bind `openedChange` back to `opened`, or Escape and backdrop clicks will leave the host out of sync.
- Material moves focus into an `over` drawer when it opens and restores it on close; keep a focusable item (a nav link) as the first thing in the drawer.
