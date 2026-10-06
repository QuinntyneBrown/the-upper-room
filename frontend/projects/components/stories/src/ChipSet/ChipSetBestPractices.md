## Best practices

### Layout

- Place a single-select chip set directly above the list or board it scopes.
- Let the set wrap; don't force chips onto one line with horizontal scrolling.

### Content

- Use `single` for mutually exclusive choices (one city, one status); use separate selectable `tar-chip`s for independent filters.
- Keep three to seven options; beyond that, use `tar-select`.
- Always give `value` a starting option so one chip is selected.

### Accessibility

- Always set `ariaLabel` to name the group ("City", "Partner status").
- In `single` mode the listbox handles arrow-key navigation and selection; don't add click handlers to individual options.
