## Best practices

### Layout

- Use it once, at the top of the profile or account settings page, centred above the person's name.
- Keep the default 96 px on profile pages; 64 px is the smallest size that still reads as a control.

### Content

- Validate type and size in the page after `fileSelected`, and tell the user with the snackbar if the upload fails.
- Pass the saved `avatarUrl` back in once the upload succeeds so the new photo appears.

### Accessibility

- The native file input sits inside the label, so the whole control is one click target and works with the keyboard file picker.
- Announce the result of the upload (success or error) rather than relying on the picture changing.
