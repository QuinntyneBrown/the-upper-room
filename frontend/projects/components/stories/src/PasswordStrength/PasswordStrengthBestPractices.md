## Best practices

### Layout

- Place the meter directly under the new-password field it describes, at the same width.
- Show it only where a password is being chosen (sign-up, reset, change password), never on sign-in.

### Content

- Pass the account's `userEmail` so passwords built from the user's own name are caught.
- Keep the server's password rules and the `evaluator` in step; the meter is guidance, the API is the authority.

### Accessibility

- Colour is never the only signal: the label and helper text state the strength and what to fix.
- Reference the meter from the input with `aria-describedby` so screen readers announce the guidance.
