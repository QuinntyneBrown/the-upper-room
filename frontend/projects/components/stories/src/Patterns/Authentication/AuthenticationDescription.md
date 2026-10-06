The signed-out journey (user guide section 2): sign in, create an account, accept an invitation, reset a password. These routes render without the app shell: no toolbar, no drawer, just the product name and one outlined `tar-card` (max 420px) centred on a `surface-container-low` page.

- **Forms** stack their fields with a 16px gap under an `<h1>` and end in one full-width filled `tar-button type="submit"`. Email and other text use `tar-text-field`; passwords use `tar-password-field` (built-in show/hide toggle, `autocomplete="current-password"` or `"new-password"`).
- **New passwords** are followed by `tar-password-strength`, bound to the same value and to the email so it can reject passwords containing it. Submit stays disabled until the policy passes and the `tar-checkbox` for the terms is ticked.
- **Invitations** pre-fill email and city as `[readonly]="true"` fields with a lock suffix icon.
- **Errors** from the server sit in a non-dismissible `tar-banner severity="error"` above the fields; per-field validation uses each field's `error` input. Confirmations use `tar-banner severity="success"`.
- **Dead ends** such as an expired invitation swap the form for a `tar-empty-state` with one action.
- Links to the neighbouring task sit under the button, coloured `--md-sys-color-primary`.

Test ids match the app's `SignIn` and `SignUp` pages (`sign-in-email`, `sign-in-password`, `sign-in-submit`, `sign-up-terms`, `invitation-expired`, …).
