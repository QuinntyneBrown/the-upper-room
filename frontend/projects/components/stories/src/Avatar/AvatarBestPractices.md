## Best practices

### Layout

- Use 40 px in list rows, 32 or 24 px in dense chips and comments, and 96 px on profile headers.
- Keep avatars at one size within a list so names line up.

### Content

- Always pass `email` as well as `displayName`; the colour is keyed on the email so it stays stable when someone edits their name.
- Use `tar-avatar-uploader` where the user can change their own picture, not a bare avatar.

### Accessibility

- The avatar is decorative (`alt=""`, no label): always show the person's name next to it.
- Don't make the avatar the only clickable target for a profile; link the name too.
