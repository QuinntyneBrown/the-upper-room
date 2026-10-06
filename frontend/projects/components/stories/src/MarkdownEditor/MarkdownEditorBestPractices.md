## Best practices

### Layout

- Give the editor the full width of the form column; the textarea starts at 200 px and resizes vertically.
- Pair it with a visible field label above, as on the idea form.

### Content

- Keep `maxLength` in step with the API's validation for the field.
- The preview is a quick approximation (bold, italic, code, headings, list items); the server's rendering is authoritative.
- Always wire `valueChange` back into `value` — the editor holds no state of its own, so without it the counter, preview and toolbar work from stale text.

### Accessibility

- Toolbar buttons are labelled only by `title` and a glyph; describe the formatting shortcuts in nearby help text.
- The active tab is shown by colour and underline only; the Write / Preview labels are the cue for everyone else.
