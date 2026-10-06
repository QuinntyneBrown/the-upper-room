A brief, non-blocking message at the bottom of the screen. The feature has two parts:

- `SnackbarService` (`providedIn: 'root'`) — call `show(message, severity = 'info', action?)`. It queues messages and exposes the visible one as the `current` signal, auto-dismissing after 4 s (`info`), 5 s (`success`) or 7 s (`warning`); `error` never auto-dismisses. `dismiss()`, `pause()` and `resume()` control the timer.
- `tar-snackbar` — render it **once** in the app shell. It reads `current` and renders a filled `mat-card`, fixed bottom-left (centred below 576px).

The card carries `.tar-snackbar` and `.tar-snackbar--{severity}` (plus `.tar-snackbar--xs` on phones), `role="alert"` for errors and `role="status"` otherwise. Inside: `.tar-snackbar__message`, an optional `mat-button` `.tar-snackbar__action`, and a close `mat-icon-button` `.tar-snackbar__dismiss` (`aria-label="Dismiss"`). Test ids: `snackbar`, `snackbar-message`, `snackbar-action`, `snackbar-dismiss`. Hover and focus pause the timer.
