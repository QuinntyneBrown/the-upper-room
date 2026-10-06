The title block at the top of every screen. `tar-page-header` is a plain `<header>` (no Material wrapper) with an optional Material `mat-icon-button` for back navigation.

The root `<header>` carries `.tar-page-header` (plus `.tar-page-header--scrolled` when `scrolled`) and `testId` is mirrored to its `data-testid`. Inside: `.tar-page-header__back` (only with `showBack`, `aria-label` from `backLabel`, `data-testid="{testId}-back"`, emits `backClicked`), then `.tar-page-header__content` holding the optional `.tar-page-header__eyebrow`, the required `title` as `<h1 class="tar-page-header__title">`, and the optional `.tar-page-header__subtitle`. Projected content goes into `.tar-page-header__actions`.

The title steps up from headline-small to headline-medium at the `md` breakpoint.
