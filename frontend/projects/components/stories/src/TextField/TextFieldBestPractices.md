## Best practices

### Layout

- Stack fields in a single column at the form's width; `fullWidth` is on by default.
- Keep `outline` appearance in forms; `fill` is for dense filter bars only.

### Content

- Labels are short nouns in sentence case ("Email", "Organisation name"); put formatting rules in `hint`, not `placeholder`.
- Errors say what to do: "Enter an email like name@example.org", not "Invalid".
- Use the right `type`, `autocomplete` and `inputmode` so phones show the right keyboard.

### Accessibility

- Always give a `label` or an `ariaLabel`; a placeholder is not a label.
- `error` renders with `role="alert"`, so it is announced as soon as it appears — set it on blur or submit, not on every keystroke.
