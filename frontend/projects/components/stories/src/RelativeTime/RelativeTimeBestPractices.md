## Best practices

### Layout

- Put it on the secondary line of a row (activity feeds, notes, "last updated" captions) in a small label style.
- Don't use it in tables that sort or compare dates; show an absolute date there.

### Content

- Pass the server's ISO timestamp straight through; don't pre-format it.
- Prefix with a verb where the meaning isn't obvious: "Updated 3h ago", "Created 2d ago".

### Accessibility

- Relative text is approximate. Where the exact time matters (event start times), show the absolute date as well.
- The label updates silently every minute; don't put it inside a live region.
