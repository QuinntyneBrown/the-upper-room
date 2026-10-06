A full-width, inline message about the state of the page or the app — imports finished, a save failed, a feature changed. `tar-banner` is a custom element (not a Material banner) that uses Material's `mat-icon`, `mat-button` and `mat-icon-button` inside.

When `visible` is true it renders `div.tar-banner.tar-banner--{severity}` with `role="alert"` for `error` and `role="status"` otherwise; `testId` is mirrored to `data-testid`. Inside: an optional `mat-icon.tar-banner__icon` (from `icon` — there is no default icon per severity), the required `message` in `.tar-banner__text` (`data-testid="{testId}-text"`), an optional `.tar-banner__action` text button labelled `actionLabel` (`{testId}-action`, emits `actioned`), and, when `dismissible`, a `.tar-banner__close` icon button labelled `dismissLabel` (`{testId}-close`, emits `dismissed`).

The banner is fully controlled: dismissing only emits; the host hides it by setting `visible` to false.
