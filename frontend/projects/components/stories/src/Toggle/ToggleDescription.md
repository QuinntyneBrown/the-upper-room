An on/off switch for a setting that takes effect immediately. `tar-toggle` wraps Angular Material's `mat-slide-toggle` and emits `checkedChange` with the new boolean. It is controlled, not a `ControlValueAccessor`: bind `checked` and update it from `checkedChange`. The label is projected content.

The `mat-slide-toggle` carries `.tar-toggle` with `data-testid` from `testId` and `aria-label` from `ariaLabel`; the projected label is wrapped in `.tar-toggle__label`. A `color` input exists, but the Material 3 theme renders every toggle in the primary colour.
