A linear progress indicator. `tar-progress-bar` wraps Angular Material's `mat-progress-bar` and forwards `mode`, `value`, `bufferValue` and `color` to it. The host is `display: block` and the bar fills its container.

The inner `mat-progress-bar` carries the BEM class `.tar-progress-bar`; `testId` is mirrored to `data-testid` and `ariaLabel` (default `"Loading"`) to `aria-label`. `mat-progress-bar` itself supplies `role="progressbar"` and, in `determinate`/`buffer` mode, `aria-valuenow`.
