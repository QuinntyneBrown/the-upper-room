An icon-only action. `tar-icon-button` wraps Angular Material's `mat-icon-button` around a `mat-icon` ligature and emits `clicked` with the native `MouseEvent`. Both `icon` and `ariaLabel` are required.

The inner `<button>` carries `.tar-icon-button`, the glyph is `.tar-icon-button__icon`, `ariaLabel` becomes `aria-label`, and `testId` is mirrored to `data-testid`. `icon` is a raw Material Icons ligature — it is not resolved through `ICON_ALIASES` the way `tar-icon` is.
