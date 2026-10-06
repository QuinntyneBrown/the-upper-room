## Best practices

### Layout

- Place pagination directly below the list or table it controls, aligned to its trailing edge.
- In narrow containers hide the page-size select and the first/last buttons.

### Content

- Pass the total item count as `length` so the range label is accurate.
- Default `pageSize` to 25; offer larger sizes only for dense list screens.
- Reset `pageIndex` to 0 when filters or search change the result set.

### Accessibility

- Material labels the navigation buttons ("Next page", "Previous page"); don't replace them with bare icons.
- After a page change, move focus or announce the new range so screen-reader users know the list updated.
