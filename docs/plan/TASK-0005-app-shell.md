---
id: TASK-0005
title: Application shell — top bar, drawer, breadcrumbs, footer
status: Accepted
phase: F
depends_on: [TASK-0002, TASK-0003, TASK-0004]
traces_to: [L2-009, L2-010, L2-011, L2-012, L2-013, L2-014, L2-026 (skip-to-content)]
estimated_context: large
---

# TASK-0005: Application shell

## Goal
Implement the persistent app shell: top bar (`64px` MD+ / `56px` XS-SM), navigation drawer (modal on XS/SM, persistent on LG+), breadcrumb row (MD+), avatar menu (placeholder, real menu in TASK-0026/0043), footer, and a skip-to-content link. The shell wraps all authenticated routes. Without auth wired yet, demo on a placeholder `/dashboard-stub` route.

## ATDD Process — REQUIRED
Write tests that drive every shell behavior FIRST, including responsive states and reduced-motion fall-throughs.

## Acceptance Tests

### Playwright E2E

**Spec file:** `frontend/projects/the-upper-room/e2e/tests/foundation/app-shell.spec.ts`

**Page Object:** `components/AppShell.ts` exposing `topBar()`, `drawerToggle()`, `drawer()`, `breadcrumbs()`, `footer()`, `skipLink()`, `avatarTrigger()`.

**Scenarios:**
1. **XS layout** — At 375px, top bar height is `56px`, drawer is hidden by default; clicking the menu button opens the drawer with a `0.32` opacity scrim and `medium2` (300ms) transition.
2. **LG layout** — At 1280px, the menu button is hidden, the drawer is permanently visible with width `280px`.
3. **Breadcrumbs** — On `/contacts/123/edit`-like stub route, breadcrumbs read `Dashboard / Contacts / [Name] / Edit` at MD+ and are absent at XS.
4. **Skip link** — First Tab key press focuses "Skip to main content"; activating it moves focus to `<main>` element.
5. **Toolbar elevation** — At scrollY 0 the toolbar has `box-shadow: none`; after scrolling 200px it has the level2 shadow.
6. **Reduced motion** — With `prefers-reduced-motion`, drawer open is instant.

### Unit (frontend)
- `breadcrumb.service.spec.ts` — derives crumbs from route data + dynamic `:id` resolvers.

## Implementation Outline

- `projects/the-upper-room/src/app/shell/` with `app-shell.component`, `top-bar.component`, `nav-drawer.component`, `breadcrumb-bar.component`, `app-footer.component`, `skip-link.component` — each in 3 files.
- Use `@angular/material/sidenav`, `@angular/material/toolbar`. Drawer items defined in a config file but not yet wired to routes (real items added in their feature tasks).
- `BreadcrumbService` resolves `data.breadcrumb` and dynamic `:id` via per-route resolver tokens.
- Responsive behavior driven by Angular CDK `BreakpointObserver` + the SCSS mixins from TASK-0004.

## Definition of Done

- [ ] All scenarios pass at XS (375), MD (768), LG (1280) viewports.
- [ ] All shell components are 3-file (no inline templates/styles).
- [ ] No inline px values for spacing; all use space tokens.
- [ ] Drawer keyboard escape closes; focus returns to the menu trigger.
- [ ] Trace comments present in every test file.

## Out of Scope
- Navigation drawer real items (added by each feature task).
- Real avatar menu (TASK-0026, 0043).
- City switcher (TASK-0051).
- Notification bell (TASK-0151).
