A compact label for a tag, filter or attribute. `tar-chip` wraps Angular Material chips and renders one of three shapes:

- default — a static `mat-chip`;
- `selectable` — a `mat-chip-option` that emits `selectionChange` with the new `selected` boolean;
- `removable` (when not `selectable`) — a `mat-chip` with a trailing `matChipRemove` close button (`aria-label="Remove {label}"`) that emits `removed`.

The chip element carries the BEM class `.tar-chip` (plus `.tar-chip--selected` when `selectable` and `selected`); the label is `.tar-chip__label` and the optional leading icon is `.tar-chip__icon`. `testId` is mirrored to `data-testid` on the chip. To group chips, or for single-choice selection, use `tar-chip-set`.
