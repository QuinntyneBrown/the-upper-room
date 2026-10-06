## Best practices

### Layout

- Replace the list, not the whole page — headers, filters and other panels stay usable.
- On retry, show `tar-skeleton` while the request runs, then the list or the error again.

### Content

- Always pass the correlation id from the failed response; it's how support traces the error.
- The heading and body are fixed copy; don't wrap the component in a second error message.
- For failures that aren't about loading a list (a save that failed), use `SnackbarService` with `error` severity.

### Accessibility

- The heading is an `h2`; check it fits the page's heading outline.
- "Try again" is a real button and reachable by keyboard; move focus back to the list once it loads.
