## Best practices

### Layout

- Always open it through `ConfirmService`; never place `tar-confirm-dialog` in a page template or hand-roll a modal.
- Keep the body to one or two sentences — the dialog is 280–560px wide.

### Content

- Title as a question naming the object: "Delete this contact?", "Archive Northside Food Bank?".
- Label the confirm button with the action ("Delete contact"), not "OK" or "Yes".
- Say what happens and whether it can be undone in `body`.
- Reserve `danger` for irreversible actions and `requireTypedConfirmation` for wiping large amounts of data, such as a whole city.

### Accessibility

- Initial focus lands on Cancel, so pressing Enter by accident never confirms a destructive action.
- The dialog is labelled by its title (`aria-labelledby="confirm-dialog-title"`); keep titles unique and descriptive.
- Escape and backdrop clicks cancel; focus returns to the element that opened the dialog.
