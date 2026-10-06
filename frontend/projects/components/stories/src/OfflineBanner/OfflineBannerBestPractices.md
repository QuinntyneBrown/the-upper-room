## Best practices

### Layout

- Render it once, in the app shell above the routed content — never per page.
- It takes the full width of its container; don't wrap it in a card.

### Content

- Keep pages usable offline where possible and let the banner explain what's limited, rather than blocking the screen.
- Don't add a second "you're offline" message in a page; the shell banner already covers it.

### Accessibility

- The offline state uses `role="alert"` so it is announced immediately; the recovery message uses `role="status"`.
- The close button is labelled by `tar-banner`'s dismiss label and is keyboard reachable.
