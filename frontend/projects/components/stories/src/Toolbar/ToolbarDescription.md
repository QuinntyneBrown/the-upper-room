The app bar across the top of the shell. `tar-toolbar` wraps Angular Material's `mat-toolbar`; the host element is `position: sticky; top: 0; z-index: 10` so it stays visible while the page scrolls.

The `mat-toolbar` carries `.tar-toolbar` (plus `.tar-toolbar--scrolled` when `scrolled`) and `testId` is mirrored to `data-testid`. Inside: an optional leading `.tar-toolbar__menu` icon button (with `showMenu`; `aria-label` from `menuAriaLabel`, `data-testid="{testId}-menu"`, emits `menuClicked`), an optional `.tar-toolbar__title` from `title`, a flexible `.tar-toolbar__spacer`, and `.tar-toolbar__actions`, which holds projected content.

The `color` input is passed to `mat-toolbar`, but `.tar-toolbar` always paints the `surface` role, so it has no visible effect under the Material 3 theme.
