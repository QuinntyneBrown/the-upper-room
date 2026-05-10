# BUG-037 — At lg+ the sticky drawer overlaps page content; ~28 kanban e2e tests time out on click (RESOLVED 2026-05-09)

**Severity**: High
**Component**: frontend (`projects/the-upper-room/src/app/shell/app-shell/app-shell.scss` and `.html`)
**Found in test**: TC-7.16 (board-view.spec.ts:100 Tag=VIP filter), and many other kanban tests post BUG-035/036 fixes
**Found**: 2026-05-09
**Status**: FIXED 2026-05-09 — wrapped drawer + breadcrumbs/main/footer in `app-shell__layout` with `display:flex` at lg+, made the drawer `flex: 0 0 280px`, and let `app-shell__content` consume the remaining width. Main now sits at `x=280` instead of `y=760`. Kanban e2e went from 20/49 to 38/49 passing on this fix (commit `ac993f4`).

## Description

`AppShell` renders the drawer as a top-level `<nav class="app-shell__drawer">` next to `<main>`,
but the host element only sets `display: block`. There is no flex / grid wrapper to lay them out
side-by-side. The result at the **lg+** breakpoint:

| Element | Position | Rect |
|---|---|---|
| `app-shell__top-bar` | sticky, top:0, z:10 | 0,0 → 1280,64 |
| `app-shell__drawer` | sticky, top:64, z:20, width:280 | **0,64 → 280,720** (full viewport height) |
| `<main>` | static block | **0,760 → 1280,…** (stacked **below** the drawer) |

`<main>` is positioned **below** the drawer in document flow because the parent is just a block
container. Visually, the drawer (sticky, z:20) stays glued to the top-left of the viewport and
**covers** any main content that scrolls behind it. Playwright observes this as
`<nav data-testid="drawer"> intercepts pointer events` and times out clicks on board controls
that happen to sit in the leftmost 280px of the visible area.

## Reproduction

1. Open `/boards/b1` at viewport ≥ 1024px after seeding `__setTestToken` / `__setRbac`.
2. Inspect: the drawer renders at the top of the page, full viewport height, with main content
   pushed below.
3. Try to click anything on the left side of main (e.g. a tag-filter chip) — Playwright reports
   the drawer intercepting pointer events, browser sees the chip blocked behind the drawer.

## Expected

At lg+ the drawer sits **next to** main (side-by-side flex / grid), not on top of it. Main's
content area is shifted right by 280px and remains fully clickable.

## Actual

Drawer occupies a 280×viewport-height block on the left side of the document at z-index 20,
visually overlapping main's content area whenever main scrolls under it.

## Suggested fix

Wrap drawer + breadcrumbs + main + footer in a flex container at lg+, **or** add `margin-left`
to main at lg+ equal to the drawer width. The flex wrapper is cleaner; an existing
`app-shell__layout` div around drawer/main with `display:flex` solves it without changing the
sticky behavior.

Cover with a regression spec: at 1280×720, assert `getBoundingClientRect()` of `<main>` has
`x === 280` (not 0) and chip clicks inside main reach their handler.
