The app shell's navigation drawer plus the content beside it. `tar-side-nav` wraps Angular Material's `mat-sidenav-container`, `mat-sidenav` and `mat-sidenav-content` (with `autosize`), and fills the height of its parent.

The container carries `.tar-side-nav`; the drawer is `mat-sidenav.tar-side-nav__drawer` (280 px wide, `surface-container`, `outline-variant` right border) and carries `data-testid` from `testId`; the content area is `.tar-side-nav__content` (`background` role). Content marked with the `tar-side-nav-content` attribute projects into the drawer; everything else projects into the content area.

`mode` (`side`, `over`, `push`), `opened`, `position` (`start`/`end`) and `fixedInViewport` pass through to `mat-sidenav`; `openedChange` re-emits Material's event so the host can keep `opened` in sync when the user closes an `over` drawer.
