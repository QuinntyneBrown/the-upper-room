## Best practices

### Layout

- Lay chips out in a wrapping row with an 8px gap — or put them in a `tar-chip-set`, which does that for you.
- Keep a row of filter chips directly above the list it filters.

### Content

- One or two words per chip: "Volunteer", "Toronto", "Hosted by me".
- Use `selectable` chips for independent on/off filters and `tar-chip-set` with `single` for one-of-many choices.
- Use `removable` for values the user added (tags on a contact), not for system facts like a contact's city.

### Accessibility

- The remove button is labelled "Remove {label}", so keep `label` meaningful on its own.
- Don't rely on the icon or the selected colour alone — the label must carry the meaning.
