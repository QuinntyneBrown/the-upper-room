A circular progress indicator. `tar-progress-spinner` wraps Angular Material's `mat-progress-spinner` and forwards `mode`, `value`, `diameter`, `strokeWidth` and `color` to it. The host is `display: inline-block`, so it sits inline with text.

The inner `mat-progress-spinner` carries the BEM class `.tar-progress-spinner`; `testId` is mirrored to `data-testid` and `ariaLabel` (default `"Loading"`) to `aria-label`. `mat-progress-spinner` supplies `role="progressbar"`.
