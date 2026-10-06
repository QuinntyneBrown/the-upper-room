A surface for grouping related content — a partner, an event, a Kanban board tile. `tar-card` wraps Angular Material's `mat-card` (with `mat-card-header`, `mat-card-title`, `mat-card-subtitle`, `mat-card-content` and `mat-card-actions`) and passes `appearance` (`filled`, `outlined` or `raised`) through.

The `mat-card` carries `.tar-card` (plus `.tar-card--interactive` when `interactive`), and `testId` is mirrored to `data-testid` on it. Inside, the header renders only when `heading` or `subheading` is set (`.tar-card__header`, `.tar-card__title`, `.tar-card__subtitle`); the default slot projects into `.tar-card__body`; and when `showActions` is true, content marked with the `tar-card-actions` attribute projects into `.tar-card__actions`.

An `interactive` card gets `role="button"`, `tabindex="0"` and a hover elevation, and emits `clicked` with the `MouseEvent` or `KeyboardEvent` (Enter).
