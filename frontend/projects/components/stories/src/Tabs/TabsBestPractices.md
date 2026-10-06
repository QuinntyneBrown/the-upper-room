## Best practices

### Layout

- Place tabs directly under the page header of a detail screen, spanning the content width.
- Keep the selected tab in the URL or page state and bind it to `selectedIndex` so back/forward and reloads land on the same tab.

### Content

- Two to five tabs, each a short noun ("Overview", "Notes", "Events").
- Give each tab a stable `id` and branch the template on it — never on the label or index.
- Prefer hiding a tab over disabling it unless the user needs to know the section exists.

### Accessibility

- Material provides the `tablist`/`tab`/`tabpanel` roles and arrow-key navigation; don't add your own key handling.
- Start each panel with its own heading level 2 when it contains more than a sentence, so the panel is navigable by headings.
