## Best practices

### Layout

- Default to `md` (24px) next to body text; `sm`/`xs` inside dense rows and chips, `lg`/`xl` only for empty states.
- Pair icons with a visible label in navigation and buttons; a lone icon needs the button around it to carry the name (`tar-icon-button`).

### Content

- Ask for the alias (`events`, `locations`, `archive`) rather than the raw ligature so a glyph change is one edit in `ICON_ALIASES`.
- Add a new alias before reusing a raw ligature in a second feature.

### Accessibility

- `mat-icon` is `aria-hidden` by default, so the icon is decorative — never rely on it alone to convey meaning.
- Status icons (`success`, `warning`, `error`) always sit beside text that says the same thing.
