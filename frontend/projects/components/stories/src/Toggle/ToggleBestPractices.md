## Best practices

### Layout

- Put the label first and the switch at the end of a settings row, or follow the default (switch then label) consistently within a list.

### Content

- Label the setting, not the action: "Show archived partners", not "Turn on archived partners".
- Use a toggle only when the change applies immediately; a choice that waits for Save is a `tar-checkbox`.

### Accessibility

- The switch is exposed with `role="switch"`, so screen readers announce on/off.
- Set `ariaLabel` only when there is no visible projected label.
