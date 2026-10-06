The primary action control. `tar-button` wraps an Angular Material button (`mat-flat-button`, `mat-stroked-button`, `mat-raised-button` or `mat-button`, chosen by `variant`) and emits `clicked` with the native `MouseEvent`.

The inner `<button>` carries the BEM classes `.tar-button` and `.tar-button--{variant}` (plus `.tar-button--full-width`), and `testId` is mirrored to `data-testid` — e2e locators depend on both. Pass `icon` with a Material Symbols ligature to render a leading `mat-icon`.
