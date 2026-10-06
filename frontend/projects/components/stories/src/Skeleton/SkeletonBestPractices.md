## Best practices

### Layout

- Match the real content: the same container, roughly the same number of rows, the same row height.
- Replace the skeleton in place when data arrives so nothing shifts.

### Content

- Use it for the first load of a list, board column or card grid; use `tar-progress-bar` for refreshes of content already on screen.
- Don't show a skeleton for an empty result — switch to `tar-empty-state`, or `tar-list-error` on failure.

### Accessibility

- The rows are purely visual; set `aria-busy="true"` on the region that is loading.
- The shimmer respects `prefers-reduced-motion`; don't add extra animation around it.
