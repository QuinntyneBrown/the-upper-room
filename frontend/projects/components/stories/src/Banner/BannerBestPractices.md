## Best practices

### Layout

- Place the banner at the top of the content area, under the page header, spanning the full width.
- Show one banner at a time; queue or combine messages rather than stacking them.
- Use a snackbar, not a banner, for transient confirmation of an action the user just took.

### Content

- One sentence that says what happened and, if needed, what to do ("Partners couldn’t be loaded. Check your connection and try again.").
- Always pass an `icon` that matches the severity — success and warning share a colour, so the icon is what tells them apart.
- `actionLabel` is a short verb ("Retry", "Invite lead"); offer at most one action.

### Accessibility

- `error` banners interrupt screen readers (`role="alert"`); reserve that severity for problems that need attention now.
- Give `dismissLabel` some context ("Dismiss announcement") when there may be more than one dismissible control on screen.
- Severity is conveyed by colour and icon; make sure the message text stands on its own.
