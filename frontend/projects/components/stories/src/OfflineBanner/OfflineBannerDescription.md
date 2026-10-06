The app-wide connectivity notice. `app-offline-banner` (class `OfflineBanner`) has no inputs or outputs: it reads `bannerState` from the root `NetworkService`, which listens to the browser's `offline` and `online` events, and renders a `tar-banner` when there is something to say.

- `offline` — an error banner (`.tar-banner--error`, `role="alert"`) with the `wifi_off` icon: "You're offline. Some features may be unavailable."
- `online` — a success banner (`.tar-banner--success`, `role="status"`) with `check_circle`: "Back online", shown for three seconds after the connection returns.
- `null` — nothing is rendered.

The banner uses `testId="offline-banner"`, so it carries `data-testid="offline-banner"`, with `offline-banner-text` and `offline-banner-close` on its text and close button. Closing it calls `NetworkService.dismiss()`. These stories provide a stub `NetworkService` so each state can be shown on demand.
