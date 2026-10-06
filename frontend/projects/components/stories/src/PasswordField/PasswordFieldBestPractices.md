## Best practices

### Layout

- Full width in the sign-in and invite-acceptance cards, directly below the email field.

### Content

- Use `autocomplete="new-password"` when setting a password so password managers offer to generate one.
- State the rules in `hint` up front ("At least 12 characters") rather than only in the error.

### Accessibility

- The toggle's `aria-label` changes with state, so screen-reader users know whether the password is visible.
- Don't block paste; password managers depend on it.
