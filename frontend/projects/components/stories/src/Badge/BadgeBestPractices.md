## Best practices

### Layout

- Put badges on icon buttons and navigation entries, not on body text.
- On a labelled button, turn `tarBadgeOverlap` off so the badge doesn't cover the label.
- Keep the default `above after` position unless it clashes with neighbouring controls.

### Content

- Show counts, not words: "3", not "New".
- Cap large numbers ("99+") before passing them in.
- Hide the badge with `tarBadgeHidden` at zero rather than showing "0".

### Accessibility

- The badge is decorative to most assistive technology; include the count in the host's accessible name ("Notifications, 3 unread").
- Never make the badge the only way to discover pending items.
