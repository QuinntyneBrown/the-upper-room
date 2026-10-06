A group of chips. `tar-chip-set` has two modes:

- `single` — renders a `mat-chip-listbox` whose `mat-chip-option`s (class `.tar-chip-set__option`) are generated from `options` (`TarChipOption { value, label, disabled? }`). The option equal to `value` is selected, and choosing one emits `valueChange` with its value.
- default — renders a `mat-chip-set` and projects its content (`<ng-content />`), for grouping `tar-chip`s.

In both modes the Material container carries the BEM class `.tar-chip-set` (a wrapping flex row with a `--md-sys-space-2` gap), `ariaLabel` is mirrored to `aria-label` and `testId` to `data-testid`.
