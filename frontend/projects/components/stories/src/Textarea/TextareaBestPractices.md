## Best practices

### Layout

- Use for notes, idea descriptions and event details — anything longer than a sentence.
- Start with `rows` close to the expected length (3–6); the user can drag to resize.

### Content

- Set `maxLength` for fields with a server limit and show the remaining count in `hint`.
- Use the placeholder for an example, not instructions that disappear once typing starts.

### Accessibility

- Always give a `label` or an `ariaLabel`.
- Don't rely on the `error` input to communicate problems until it is displayed; surface validation text another way (for example in `hint`).
