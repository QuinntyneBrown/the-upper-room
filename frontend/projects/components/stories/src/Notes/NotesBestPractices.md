## Best practices

### Layout

- Give notes their own tab or a side panel on a detail page; it is a full-width block with its own padding.
- One `tar-notes` per record — `subjectType` and `subjectId` identify exactly whose notes are shown.

### Content

- `subjectType` must be one the API accepts: `Contact`, `Partner`, `Idea` or `Event`.
- Notes are Markdown; the server returns sanitised HTML, which is what the list renders.

### Accessibility

- The composer placeholder is its only label; give the surrounding section a heading such as "Notes" so the textarea has context.
- Errors appear as text below the composer and focus returns to the textarea so the user can fix it.
